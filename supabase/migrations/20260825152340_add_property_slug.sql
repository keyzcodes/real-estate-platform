-- Add a readable, stable URL identifier to every property.
alter table public.properties
    add column slug varchar(170);

-- Generate slugs for any properties that already exist.
update public.properties
set slug =
    left(
        coalesce(
            nullif(
                trim(
                    both '-' from regexp_replace(
                        lower(title),
                        '[^a-z0-9]+',
                        '-',
                        'g'
                    )
                ),
                ''
            ),
            'property'
        ),
        150
    )
    || '-'
    || substring(id::text from 1 for 12);

alter table public.properties
    alter column slug set not null;

alter table public.properties
    add constraint properties_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

create unique index properties_slug_unique_idx
    on public.properties(slug);

-- Generate the slug automatically when a property is created.
create or replace function public.assign_property_slug()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
    base_slug text;
begin
    base_slug :=
        trim(
            both '-' from regexp_replace(
                lower(new.title),
                '[^a-z0-9]+',
                '-',
                'g'
            )
        );

    if base_slug = '' then
        base_slug := 'property';
    end if;

    new.slug :=
        left(base_slug, 150)
        || '-'
        || substring(new.id::text from 1 for 12);

    return new;
end;
$$;

create trigger properties_assign_slug_before_insert
before insert on public.properties
for each row
execute function public.assign_property_slug();

revoke execute
on function public.assign_property_slug()
from public, anon, authenticated;