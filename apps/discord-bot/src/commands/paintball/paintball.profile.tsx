import { Container, Footer, Header, SidebarItem, Table } from '#components';
import { formatTime, prettify } from '@statsify/util';
import { BaseProfileProps } from '../base.hypixel-command';

export const PaintballProfile = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  t,
}: BaseProfileProps) => {
  const { paintball } = player.stats;

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(paintball.coins), '§6'],
    [t('stats.forcefieldTime'), formatTime(paintball.forcefieldTime), '§e'],
    [t('stats.hat'), prettify(paintball.hat), '§7'],
    [t('stats.killstreaks'), t(paintball.killstreaks), '§b'],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l§bPaint§fball §fStats`}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t('stats.wins')} value={t(paintball.wins)} color="§a" />
          <Table.td title={t('stats.shotsFired')} value={t(paintball.shotsFired)} color="§c" />
          <Table.td
            title={t('stats.shotAccuracy')}
            value={`${paintball.shotAccuracy}%`}
            color="§6"
          />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.kills')} value={t(paintball.kills)} color="§a" />
          <Table.td title={t('stats.deaths')} value={t(paintball.deaths)} color="§c" />
          <Table.td title={t('stats.kdr')} value={t(paintball.kdr)} color="§6" />
        </Table.tr>
        <Table.ts title={`§6Perks`}>
          <Table.tr>
            <Table.td
              title={t('stats.adrenaline')}
              value={t(paintball.perks.adrenaline)}
              color="§c"
              size="small"
            />
            <Table.td
              title={t('stats.endurance')}
              value={t(paintball.perks.endurance)}
              color="§6"
              size="small"
            />
            <Table.td
              title={t('stats.fortune')}
              value={t(paintball.perks.fortune)}
              color="§b"
              size="small"
            />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t('stats.godfather')}
              value={t(paintball.perks.godfather)}
              color="§a"
              size="small"
            />
            <Table.td
              title={t('stats.headstart')}
              value={t(paintball.perks.headstart)}
              color="§c"
              size="small"
            />
            <Table.td
              title={t('stats.superluck')}
              value={t(paintball.perks.superluck)}
              color="§6"
              size="small"
            />
            <Table.td
              title={t('stats.transfusion')}
              value={t(paintball.perks.transfusion)}
              color="§b"
              size="small"
            />
          </Table.tr>
        </Table.ts>
      </Table.table>

      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
