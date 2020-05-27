import dungeon from './dungeon';
import hud from './hud';
import link_sprite from './link_sprite';
import shield from './shield';
import sword from './sword';
import overworld from './overworld';

import compact from 'lodash/compact';
import flatten from 'lodash/flatten';

export default function(options) {
    return flatten(
        compact([
            options.randomize_dungeon && dungeon,
            options.randomize_hud && hud,
            options.randomize_link_sprite && link_sprite,
            options.randomize_sword && sword,
            options.randomize_shield && shield,
            options.randomize_overworld && overworld,
        ])
    );
}
