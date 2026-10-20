import {
  ArrowRight,
  Archive,
  CalendarBlank,
  CheckCircle,
  DotsThree,
  PencilSimple,
  ShieldChevron,
} from '@phosphor-icons/react';
import { Link } from 'react-router';
import academyPhoto from '../../assets/team-card-academy.png';
import professionalPhoto from '../../assets/team-card-professional.png';
import womenPhoto from '../../assets/team-card-women.png';
import type { SportingTeam } from '../../lib/api';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

type TeamCardProps = {
  team: SportingTeam;
  selected: boolean;
  onSelect: () => void;
  canManage?: boolean;
  canArchive?: boolean;
  onEdit?: () => void;
  onArchive?: () => void;
};

function teamPhoto(team: SportingTeam) {
  const category =
    `${team.categoryKey} ${team.categoryLabel}`.toLocaleLowerCase('tr-TR');
  if (category.includes('kadın') || category.includes('women')) {
    return womenPhoto;
  }
  if (
    category.includes('profesyonel') ||
    category.includes('professional') ||
    category.includes('senior')
  ) {
    return professionalPhoto;
  }
  return academyPhoto;
}

/** A photographic, data-backed team card for the sporting directory. */
export function TeamCard({
  team,
  selected,
  onSelect,
  canManage = false,
  canArchive = false,
  onEdit,
  onArchive,
}: TeamCardProps) {
  const season = team.teamSeasons[0]?.clubSeason.name ?? 'Sezon TBD';
  return (
    <Card className="team-reference-card">
      <div className="team-reference-card__media">
        <img src={teamPhoto(team)} alt="" aria-hidden="true" />
        <span className="team-reference-card__mark" aria-hidden="true">
          <ShieldChevron weight="duotone" />
        </span>
      </div>
      <CardContent className="team-reference-card__content">
        <div>
          <Link
            className="team-reference-card__title"
            to={'/app/teams/' + team.id}
          >
            {team.name}
          </Link>
          <p>
            {team.categoryLabel} · {team.ageGroupLabel ?? 'Yaş grubu TBD'}
          </p>
        </div>
        <div className="team-reference-card__season">
          <CalendarBlank aria-hidden="true" />
          <span>{season}</span>
        </div>
        <div className="team-reference-card__actions">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={selected}
            aria-label={team.name + ' takımını seç'}
            onClick={onSelect}
          >
            {selected && <CheckCircle weight="fill" aria-hidden="true" />}
            {selected ? 'Seçili takım' : 'Çalışma takımı seç'}
          </Button>
          <div className="team-reference-card__secondary-actions">
            <Button asChild size="icon" variant="ghost" className="size-8">
              <Link
                to={'/app/teams/' + team.id}
                aria-label={team.name + ' takım detayını aç'}
              >
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    id={`team-actions-${team.id}`}
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    aria-label={team.name + ' takım işlemleri'}
                  >
                    <DotsThree weight="bold" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={onEdit}>
                    <PencilSimple aria-hidden="true" /> Düzenle
                  </DropdownMenuItem>
                  {canArchive && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={onArchive}
                      >
                        <Archive aria-hidden="true" /> Arşivle
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
