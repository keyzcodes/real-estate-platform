begin;

create table public.unit_fees (
    id uuid primary key default gen_random_uuid(),

    unit_id uuid not null
        references public.property_units(id) on delete cascade,

    fee_type varchar(30) not null,
    fee_name varchar(100) not null,
    description text,

    amount numeric(12, 2) not null,
    currency char(3) not null default 'NGN',

    payment_frequency varchar(20) not null default 'one_time',
    is_mandatory boolean not null default true,
    is_refundable boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint unit_fees_name_not_blank
        check (char_length(trim(fee_name)) > 0),

    constraint unit_fees_type_allowed
        check (
            fee_type in (
                'caution',
                'service',
                'maintenance',
                'legal',
                'agent',
                'application',
                'other'
            )
        ),

    constraint unit_fees_amount_valid
        check (amount >= 0),

    constraint unit_fees_currency_format
        check (currency ~ '^[A-Z]{3}$'),

    constraint unit_fees_frequency_allowed
        check (
            payment_frequency in (
                'one_time',
                'monthly',
                'quarterly',
                'yearly'
            )
        ),

    constraint unit_fees_other_requires_description
        check (
            fee_type <> 'other'
            or (
                description is not null
                and char_length(trim(description)) > 0
            )
        )
);

create unique index unit_fees_one_agent_fee_per_unit_idx
    on public.unit_fees(unit_id)
    where fee_type = 'agent';

create index unit_fees_unit_mandatory_idx
    on public.unit_fees(unit_id, is_mandatory);

create trigger unit_fees_set_updated_at
before update on public.unit_fees
for each row
execute function public.set_updated_at();

alter table public.unit_fees enable row level security;

revoke all on table public.unit_fees
from anon, authenticated;

commit;