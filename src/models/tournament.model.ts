import { db } from "../db";
import { UserData } from "./authentication.model";

export interface TeamData {
    isLeader: boolean;
    teamName: string;
    joinCode?: string;
    teamMates: {
        name: string;
        isLeader: boolean;
    }[];
}

class TournamentModel {
    // Submissions -------------------------------------------------------------------------------------
    public async addSubmission(user: UserData, file: Express.Multer.File) {
        await db.query(
            `INSERT INTO CCG.TeamSubmission(owningTeam, submitter, contents)
            VALUES($1, $2, $3)
            returning id;`,
            [await this.getTeam(user), user.uid, file.buffer]
        );
    }

    public async getTeamSubmissionInfo(user: UserData) {
        return (await db.query(
            `SELECT
                AC.username as "submitter",
                TS.submitted,
                TS.id as "submissionID"
            FROM  CCG.TeamSubmission as TS, CCG.Account as AC
            WHERE owningTeam = $1
              AND AC.accountID = TS.submitter
            ORDER BY TS.submitted DESC
            LIMIT 5;`,
            [await this.getTeam(user)]
        )).rows;
    }

    public async getSubmissionData(user: UserData, submissionID: number) {
        const query = await db.query(
            `SELECT contents
            FROM  CCG.TeamSubmission
            WHERE owningTeam = $1
              AND id = $2;`,
            [await this.getTeam(user), submissionID]
        );
        if (query.rowCount === 0) {
            return null;
        }
        return query.rows[0].contents as Buffer;
    }

    public async getLatestSubmissionData(teamId: number) {
        const query = await db.query(
            `SELECT contents
            FROM  CCG.TeamSubmission
            WHERE owningTeam = $1
            ORDER BY submitted DESC
            LIMIT 1;`,
            [teamId]
        );
        if (query.rowCount === 0) {
            return null;
        }
        return query.rows[0].contents as Buffer;
    }

    // Team Leader Actions -----------------------------------------------------------------------------
    public async createTeam(
        user: UserData,
        teamName: string,
        contactName: string,
        contactEmail: string,
        contactOrg: string
    ) {
        if (await this.isMemberOfTeam(user)) {
            return Promise.reject({
                problem: "Cannot form a team, you are already already on a team"
            });
        }

        const tournamentId = await this.getActiveTournament();
        const newTeam = await db.query(
            `INSERT INTO CCG.TournamentTeam(tournamentID, teamName, contactName, contactEmail, contactOrg)
            VALUES($1, $2, $3, $4, $5)
            returning id;`,
            [tournamentId, teamName, contactName, contactEmail, contactOrg]
        );

        await db.query(
            `INSERT INTO CCG.TournamentParticipant(accountID, teamID, tournamentID, isTeamOwner)
            VALUES($1, $2, $3, true);`,
            [user.uid, newTeam.rows[0].id, tournamentId]
        );

        return this.getTeamInformation(user);
    }

    public async dissolveTeam(user: UserData) {
        await db.query(
            `
            DELETE FROM CCG.TournamentTeam
            WHERE id = $1;`,
            [await this.getLedTeam(user)]
        );
    }

    public async changeTeamCode(user: UserData) {
        const code = await db.query(
            `
            UPDATE CCG.TournamentTeam
            WHERE id = $1
            SET joinCode = md5(random()::text)
            returning joinCode as "joinCode";`,
            [await this.getLedTeam(user)]
        );
        return code.rows[0].joinCode as string;
    }

    public async getTeamInformation(user: UserData): Promise<TeamData> {
        if (!(await this.isMemberOfTeam(user))) {
            return Promise.reject({
                problem: "Your not on a team"
            });
        }
        const teamRole = (await db.query(
            `
            SELECT teamID as "teamID",
            isTeamOwner as "isTeamOwner"
            FROM CCG.TournamentParticipant
            WHERE accountID = $1
            AND   tournamentID = $2;`,
            [user.uid, await this.getActiveTournament()]
        )).rows[0];

        let teamData;
        if (teamRole.isTeamOwner) {
            teamData = (await db.query(
                `
            SELECT teamName as "teamName",
            joinCode as "joinCode"
            FROM CCG.TournamentTeam
            WHERE id = $1`,
                [teamRole.teamID]
            )).rows[0];
        } else {
            teamData = (await db.query(
                `
            SELECT teamName as "teamName"
            FROM CCG.TournamentTeam
            WHERE id = $1`,
                [teamRole.teamID]
            )).rows[0];
        }

        const teamMembers = await db.query(
            `
            SELECT ACC.username as "name",
                   TP.isTeamOwner as "isLeader"
            FROM CCG.TournamentParticipant as TP, CCG.Account as ACC
            WHERE TP.accountID = ACC.accountID
            AND   TP.teamId = $1
            AND   TP.accountID <> $2
            AND   TP.tournamentID = $3;`,
            [teamRole.teamID, user.uid, await this.getActiveTournament()]
        );

        return {
            isLeader: teamRole.isTeamOwner,
            teamName: teamData.teamName,
            joinCode: teamData.joinCode,
            teamMates: teamMembers.rows
        };
    }

    /** Returns the team a user is leading (or error if none) */
    private async getLedTeam(user: UserData) {
        const teamId = await db.query(
            `
            SELECT teamID as "teamID" FROM CCG.TournamentParticipant
            WHERE accountID = $1
            AND   tournamentID = $2
            AND   isTeamOwner = true;`,
            [user.uid, await this.getActiveTournament()]
        );
        if (teamId.rowCount < 1) {
            return Promise.reject({
                problem: "You are not the leader of a team."
            });
        }
        return teamId.rows[0].teamID as number;
    }

    private async getTeam(user: UserData) {
        const teamId = await db.query(
            `
            SELECT teamID as "teamID" FROM CCG.TournamentParticipant
            WHERE accountID = $1
            AND   tournamentID = $2`,
            [user.uid, await this.getActiveTournament()]
        );
        if (teamId.rowCount < 1) {
            return Promise.reject({
                problem: "You are not the leader of a team."
            });
        }
        return teamId.rows[0].teamID as number;
    }

    // Team Member Actions -----------------------------------------------------------------------------
    public async joinTeam(user: UserData, code: string) {
        if (await this.isMemberOfTeam(user)) {
            return Promise.reject({
                problem: "Cannot join team,  you are already already on a team"
            });
        }

        const teamExists = await db.query(
            `
            SELECT id FROM CCG.TournamentTeam
            WHERE joinCode = $1;`,
            [code]
        );

        if (teamExists.rowCount === 0) {
            return Promise.reject({
                problem: "No team exists with that join code."
            });
        }

        await db.query(
            `INSERT INTO CCG.TournamentParticipant(accountID, teamID, tournamentID, isTeamOwner)
            VALUES($1, $2, $3, false);`,
            [user.uid, teamExists.rows[0].id, await this.getActiveTournament()]
        );

        return this.getTeamInformation(user);
    }

    public async exitTeam(user: UserData) {
        if (!(await this.isMemberOfTeam(user))) {
            return Promise.reject({
                problem: "Cannot leave team your not in one"
            });
        }

        const tournamentId = await this.getActiveTournament();
        await db.query(
            `
            DELETE FROM CCG.TournamentParticipant
            WHERE accountID = $1
            AND   tournamentID = $2;`,
            [user.uid, tournamentId]
        );
    }

    // Utilities  ---------------------------------------------------------------------------------------
    private async getActiveTournament(): Promise<string> {
        const result = await db.query(`
            SELECT id FROM CCG.AITournament
            WHERE active = true;
        `);
        if (result.rowCount === 0) {
            return Promise.reject({
                problem: "No Active tournament"
            });
        } else if (result.rowCount > 1) {
            return Promise.reject({
                problem: "Multiple Active tournaments"
            });
        }
        return result.rows[0].id;
    }

    private async isMemberOfTeam(user: UserData): Promise<boolean> {
        const result = await db.query(
            `
            SELECT accountID FROM CCG.TournamentParticipant
            WHERE accountID = $1
            AND   tournamentID = $2;
        `,
            [user.uid, await this.getActiveTournament()]
        );
        return result.rowCount > 0;
    }
    // Admin --------------------------------------------------------

    public async getContestants(): Promise<any[]> {
        return (await db.query(
            `
            SELECT TP.isTeamOwner as "isTeamOwner", TM.teamName as "teamName", AC.username
            FROM CCG.TournamentParticipant as TP, CCG.TournamentTeam as TM, CCG.Account as AC
            WHERE TP.teamID = TM.id
            AND   TP.accountID = AC.accountID;
        `
        )).rows;
    }

    public async getTeamInfo(): Promise<any[]> {
        return (await db.query(
            `
            SELECT CCG.TournamentTeam.teamName as "teamName",
                   CCG.TournamentTeam.id as "id",
                   (SELECT submitted FROM CCG.TeamSubmission
                    WHERE CCG.TeamSubmission.owningTeam = CCG.TournamentTeam.id
                      ORDER BY submitted DESC
                      LIMIT 1) as "lastSubmission",
                    (SELECT COUNT(submitted) FROM CCG.TeamSubmission
                        WHERE CCG.TeamSubmission.owningTeam = CCG.TournamentTeam.id) as "numberOfSubmissions",
                   array(
                        SELECT AC.username
                        FROM CCG.TournamentParticipant as TP, CCG.Account as AC
                        WHERE TP.teamID = CCG.TournamentTeam.id
                          AND TP.accountID = AC.accountID
                    ) as members
            FROM CCG.TournamentTeam;
        `
        )).rows;
    }
}

export const tournamentModel = new TournamentModel();
