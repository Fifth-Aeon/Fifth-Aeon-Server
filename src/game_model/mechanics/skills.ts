import { Mechanic, targetType } from '../mechanics';
import { store } from '../store';
import { Collections, Type, Types } from '../dataTypes';
import { Player } from '../player';
import { Card } from '../card';
import { Entity } from '../entity';


/**
 * Basic mechanic that deals n damage to a target player or entity
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
 * Basic mechanic that kills an entity
 */
let kill = new Mechanic(targetType.entity);
kill.addParam('amount', new Type(Types.integer));
kill.addEffect((target, params) => {
    target = target as Entity;
    target.die();
});
kill.setText('{target} draws {amount} cards.');
store.registerMechanic('kill', kill);