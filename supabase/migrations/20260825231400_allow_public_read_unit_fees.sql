grant select (
    id,
    unit_id,
    fee_type,
    fee_name,
    description,
    amount,
    currency,
    payment_frequency,
    is_mandatory,
    is_refundable
)
on table public.unit_fees
to anon, authenticated;

create policy unit_fees_public_read
on public.unit_fees
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.property_units
        join public.properties
          on properties.id = property_units.property_id
        where property_units.id = unit_fees.unit_id
          and properties.publication_status = 'published'
          and properties.verification_status = 'verified'
    )
);