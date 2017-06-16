import { Mechanic, targetType } from '../mechanics';
import { store } from '../store';
import { Collections, Type, Types } from '../dataTypes';
import { Player } from '../player';
import { Card } from '../card';
import { Unit } from '../unit';


/**
 * Basic mechanic that deals n damage to a target player or unit
 */
let damage = new Mechanic(targetType.all);
damage.addParam('amount', new Type(Types.integer));
damage.addEffect((target, params) => {
    target.takeDamage(params.get('amount'));
});
damage.setText('Deal {amount} damage to {target}.');
store.registerMechanic('dealDamage', damage);

/**
 * Basic mechanic that causes a player to draw cards
 */
let draw = new Mechanic(targetType.player);
draw.addParam('amount', new Type(Types.integer));
draw.addEffect((target, params) => {
    target = target as Player;
    target.drawCards(params.get('amount'));
});
draw.setText('{target} draws {amount} cards.');
store.registerMechanic('drawCards', draw);


/**
 * Basic mechanic that kills an unit
 */
let kill = new Mechanic(targetType.unit);
kill.addParam('amount', new Type(Types.integer));
kill.addEffect((target, params) => {
    target = target as Unit;
    target.die();
});
kill.setText('{target} draws {amount} cards.');
store.registerMechanic('kill', kill);