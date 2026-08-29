# ADR-006 — Transparent Rental Pricing

## Status

Accepted

## Date

29 August 2026

## Decision Owner

Sunday Jime

## Context

A central goal of the Real Estate Platform is to reduce misleading rental prices, hidden charges and inflated agent fees.

A property may have:

- Multiple rentable units
- Different base rents
- Different currencies
- Monthly, quarterly or yearly billing periods
- Mandatory fees
- Optional fees
- One-time fees
- Recurring fees
- Refundable deposits
- Non-refundable charges
- Declared agent fees

Returning one unexplained property price would hide important differences and could mislead customers about the real cost of renting a property.

## Decision

The platform will:

1. Store base rent on each rentable unit.
2. Store additional fees separately from base rent.
3. Record each fee’s purpose and payment conditions.
4. Identify whether each fee is mandatory.
5. Identify whether each fee is refundable.
6. Record the payment frequency of each fee.
7. Preserve the currency associated with rent and fees.
8. Group catalogue starting prices by currency and billing period.
9. Avoid combining incompatible prices into one unexplained total.
10. Present declared agent fees separately when that feature is implemented.

## Public Catalogue Price Representation

The list endpoint returns:

```json
{
  "startingPrices": [
    {
      "amount": 300000,
      "currency": "NGN",
      "billingPeriod": "yearly"
    }
  ]
}

startingPrices contains the lowest base rent among currently available units for each unique currency and billing-period combination.

The response is an array because a property may contain more than one valid price group.

For example:

{
  "startingPrices": [
    {
      "amount": 300000,
      "currency": "NGN",
      "billingPeriod": "yearly"
    },
    {
      "amount": 30000,
      "currency": "NGN",
      "billingPeriod": "monthly"
    },
    {
      "amount": 500,
      "currency": "USD",
      "billingPeriod": "monthly"
    }
  ]
}

These values must remain separate because they cannot be compared as ordinary numbers.

Property-Detail Price Representation

The detail endpoint returns the base rent for each unit:

{
  "baseRent": {
    "amount": 300000,
    "currency": "NGN",
    "billingPeriod": "yearly"
  }
}

Additional fees are returned separately:

{
  "fees": [
    {
      "feeType": "caution",
      "feeName": "Refundable caution deposit",
      "description": "Refundable according to the tenancy conditions.",
      "amount": 30000,
      "currency": "NGN",
      "paymentFrequency": "one_time",
      "isMandatory": true,
      "isRefundable": true
    }
  ]
}
Fee Categories

The system should distinguish between:

Base rent
Mandatory one-time fees
Mandatory recurring fees
Optional fees
Refundable deposits
Non-refundable charges
Maintenance or service fees
Legal or agreement fees
Declared agent fees

Fees with different payment frequencies must not be silently combined.

Alternatives Considered
Return one minimum numeric price

This would be simple for the frontend to display.

It was rejected because the lowest numeric value might represent a monthly price while another value represents yearly rent. Comparing them directly would be misleading.

Convert every price into a monthly equivalent

This could create one comparable figure.

It was rejected for the current implementation because:

Billing agreements may not divide cleanly.
A yearly obligation may require full advance payment.
Currency conversion would require exchange-rate data.
Normalisation could hide the original contractual payment terms.

Normalised comparison may be added later, but original prices must always remain visible.

Combine base rent and all fees

This could provide one total amount.

It was rejected because:

Some fees are recurring.
Some fees are one-time.
Some fees are optional.
Some fees are refundable.
Different payment dates may apply.
Combining them would hide the nature of each charge.
Store fees as free text

This would make data entry flexible.

It was rejected because free text would prevent reliable filtering, validation, calculation and disclosure.

Consequences
Positive
Customers can see the composition of rental costs.
Refundable and non-refundable charges remain distinguishable.
The platform avoids misleading monthly-versus-yearly comparisons.
Multiple currencies can be represented safely.
Future fee reporting and analysis become possible.
The pricing model supports the platform’s transparency goal.
Negative
The database model is more complex.
The API response contains nested pricing structures.
The frontend must display multiple price groups clearly.
Calculating a complete payable amount requires payment-context rules.
Providers must enter fee information accurately.
Data Integrity Requirements

Pricing records must enforce:

Non-negative monetary amounts
Valid currency codes
Allowed billing periods
Allowed payment frequencies
Valid parent-unit relationships
Explicit mandatory status
Explicit refundable status

A fee must not exist without a valid rentable unit.

Security and Visibility

Public fee access is allowed only when the fee belongs to a unit within a property that is:

published
verified

Visitors must not be allowed to:

Insert fees
Modify fees
Delete fees
Read fees belonging to private properties

These rules are enforced through database grants and Row Level Security.

Presentation Requirements

The frontend must:

Show the currency with every amount.
Show the billing period with base rent.
Show the payment frequency of every fee.
Clearly identify mandatory fees.
Clearly identify optional fees.
Clearly identify refundable fees.
Avoid presenting startingPrices as the complete payable amount.
Avoid combining incompatible charges without explanation.
Validation

Tests must confirm that:

Only available units contribute to startingPrices.
The lowest price is selected within each compatible group.
Monthly and yearly prices remain separate.
Different currencies remain separate.
Fees remain separate from base rent.
Mandatory and refundable flags are returned correctly.
Fees belonging to inaccessible properties are not publicly readable.
Future Review

This decision should be reviewed when the platform implements:

Provider property-management forms
Agent-fee disclosure
Booking
Payments
Deposits
Currency conversion
Price normalisation
Promotions or discounts
Tax calculation
Total move-in-cost estimates

Any future total-price calculation must remain explainable and must preserve the original base rent and individual fee records.