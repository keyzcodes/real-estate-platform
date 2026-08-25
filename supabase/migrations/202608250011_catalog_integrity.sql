begin;

create function public.validate_unit_fee_currency()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not exists (
        select 1
        from public.property_units
        where id = new.unit_id
          and currency = new.currency
    ) then
        raise exception
            'Fee currency must match unit currency'
            using errcode = '23514';
    end if;

    return new;
end;
$$;

create trigger unit_fees_validate_currency
before insert or update of unit_id, currency
on public.unit_fees
for each row
execute function public.validate_unit_fee_currency();

alter table public.tour_scenes
drop constraint tour_scenes_panorama_media_id_fkey;

alter table public.tour_scenes
add constraint tour_scenes_panorama_media_id_fkey
foreign key (panorama_media_id)
references public.property_media(id)
on delete restrict;

create function public.protect_tour_panorama_integrity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if exists (
        select 1
        from public.tour_scenes
        where panorama_media_id = old.id
    )
    and (
        new.media_type <> 'panorama'
        or new.property_id <> old.property_id
    ) then
        raise exception
            'Tour panorama type and property cannot be changed while in use'
            using errcode = '23514';
    end if;

    if new.verification_status <> 'approved'
       and exists (
           select 1
           from public.tour_scenes as scene
           join public.virtual_tours as tour
             on tour.id = scene.tour_id
           where scene.panorama_media_id = old.id
             and tour.publication_status = 'published'
       )
    then
        raise exception
            'Published tour panorama cannot lose approval'
            using errcode = '23514';
    end if;

    return new;
end;
$$;

create trigger property_media_protect_tour_panorama
before update of verification_status, media_type, property_id
on public.property_media
for each row
execute function public.protect_tour_panorama_integrity();

create function public.validate_property_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if new.publication_status = 'published' then
        if not exists (
            select 1
            from public.property_locations
            where property_id = new.id
        ) then
            raise exception
                'Published property requires a verified location record'
                using errcode = '23514';
        end if;

        if not exists (
            select 1
            from public.property_units
            where property_id = new.id
        ) then
            raise exception
                'Published property requires at least one unit'
                using errcode = '23514';
        end if;

        if not exists (
            select 1
            from public.property_media
            where property_id = new.id
              and media_type = 'image'
              and is_cover = true
              and verification_status = 'approved'
        ) then
            raise exception
                'Published property requires an approved cover image'
                using errcode = '23514';
        end if;
    end if;

    return new;
end;
$$;

create trigger properties_validate_publication_insert
before insert
on public.properties
for each row
execute function public.validate_property_publication();

create trigger properties_validate_publication_update
before update of publication_status
on public.properties
for each row
execute function public.validate_property_publication();

revoke execute
on function public.validate_unit_fee_currency()
from public, anon, authenticated;

revoke execute
on function public.protect_tour_panorama_integrity()
from public, anon, authenticated;

revoke execute
on function public.validate_property_publication()
from public, anon, authenticated;

commit;