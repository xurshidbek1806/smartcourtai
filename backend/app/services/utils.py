"""Small domain helpers — reference numbers, state fee calculation."""
import random
from datetime import datetime, timezone

# Davlat boji (state fee) — simplified MVP rule.
# Real rule depends on dispute type and amount; here we approximate.
BRV = 412_000  # Bazaviy hisoblash miqdori (2026, approximate, UZS)


def generate_reference() -> str:
    year = datetime.now(timezone.utc).year
    seq = random.randint(1, 999_999)
    return f"{year}-{seq:06d}"


def calculate_state_fee(amount: float | None, dispute_type: str = "civil") -> float:
    """Approximate state fee. Property/economic claims scale with amount."""
    if not amount or amount <= 0:
        return round(BRV * 1.0)  # fixed minimal fee for non-monetary claims

    # ~2% of claim amount, with a floor of 1 BRV, cap of 50 BRV (simplified)
    fee = amount * 0.02
    fee = max(fee, BRV * 1.0)
    fee = min(fee, BRV * 50)
    return round(fee)
