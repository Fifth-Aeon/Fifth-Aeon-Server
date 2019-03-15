import * as express from "express";
import * as multer from "multer";

import { UserData } from "../models/authentication.model";
import { passwords } from "../passwords";
import { tournamentModel } from "../models/tournament.model";
import { validators } from "./validators";

const router = express.Router();
const fileUploader = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 // no larger than 1mb
    }
});

router.post(
    "/createTeam",
    passwords.authorize,
    validators.requiredAttributes([
        "teamName",
        "contactEmail",
        "contactName",
        "contactOrg"
    ]),
    async (req, res, next) => {
        try {
            const user: UserData = (req as any).user;
            res.json(
                await tournamentModel.createTeam(
                    user,
                    req.body.teamName,
                    req.body.contactEmail,
                    req.body.contactName,
                    req.body.contactOrg
                )
            );
        } catch (e) {
            next(e);
        }
    }
);

router.post(
    "/joinTeam",
    passwords.authorize,
    validators.requiredAttributes(["joinCode"]),
    async (req, res, next) => {
        try {
            const user: UserData = (req as any).user;
            res.json(await tournamentModel.joinTeam(user, req.body.joinCode));
        } catch (e) {
            next(e);
        }
    }
);

router.post("/exitTeam", passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        await tournamentModel.exitTeam(user);
        res.json({ message: "done" });
    } catch (e) {
        next(e);
    }
});

router.post("/dissolveTeam", passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        await tournamentModel.dissolveTeam(user);
        res.json({ message: "done" });
    } catch (e) {
        next(e);
    }
});

router.post(
    "/submit",
    passwords.authorize,
    fileUploader.single("submission"),
    async (req, res, next) => {
        try {
            const user: UserData = (req as any).user;
            await tournamentModel.addSubmission(user, req.file);
            res.json({ message: "done" });
        } catch (e) {
            next(e);
        }
    }
);

router.get("/teamInfo", passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        res.json(await tournamentModel.getTeamInformation(user));
    } catch (e) {
        next(e);
    }
});

router.get("/submissions", passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        res.json(await tournamentModel.getTeamSubmissionInfo(user));
    } catch (e) {
        next(e);
    }
});

router.get("/submission/:id", passwords.authorize, async (req, res, next) => {
    try {
        const user: UserData = (req as any).user;
        const data = await tournamentModel.getSubmissionData(
            user,
            req.params.id
        );
        if (data === null) {
            res.send({ message: "No such submission." });
            return;
        }
        res.writeHead(200, {
            "Content-Type": "application/zip",
            "Content-disposition": "attachment;filename=" + "submission.zip",
            "Content-Length": data.length
        });
        res.end(data);
    } catch (e) {
        next(e);
    }
});

export const tournamentRouter = router;
