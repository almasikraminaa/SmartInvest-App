import numpy as np


def safe_float(value):
    try:
        return float(value)
    except:
        return None


def minmax_score(
    metric_dict,
    higher_is_better=True
):
    clean = {}

    for key, value in metric_dict.items():

        value = safe_float(value)

        clean[key] = (
            value
            if value is not None
            else np.nan
        )

    valid_values = [
        v for v in clean.values()
        if np.isfinite(v)
    ]

    if len(valid_values) == 0:

        return {
            key: 0.5
            for key in metric_dict
        }

    min_v = min(valid_values)
    max_v = max(valid_values)

    if np.isclose(
        max_v,
        min_v
    ):
        return {
            key: 1.0
            for key in metric_dict
        }

    scores = {}

    for key, value in clean.items():

        if not np.isfinite(value):

            scores[key] = 0.5

        else:

            raw = (
                value - min_v
            ) / (
                max_v - min_v
            )

            scores[key] = (
                raw
                if higher_is_better
                else 1 - raw
            )

    return scores


def beta_suitability_score(
    beta_dict,
    market_trend
):

    if market_trend == "Bullish":

        target_beta = 1.10

    elif market_trend == "Bearish":

        target_beta = 0.60

    else:

        target_beta = 0.90

    scores = {}

    for key, beta in beta_dict.items():

        beta = safe_float(beta)

        if beta is None:

            scores[key] = 0.5

        else:

            distance = abs(
                beta - target_beta
            )

            scores[key] = max(
                0.0,
                1.0 - (
                    distance / 1.5
                )
            )

    return scores


def composite_portfolio_scoring(
    portfolios,
    market_trend
):

    returns = {
        name: p["annual_return"]
        for name, p
        in portfolios.items()
    }

    risks = {
        name: p["annual_risk"]
        for name, p
        in portfolios.items()
    }

    sharpes = {
        name: p["sharpe_ratio"]
        for name, p
        in portfolios.items()
    }

    alphas = {
        name: p.get(
            "alpha",
            0
        )
        for name, p
        in portfolios.items()
    }

    betas = {
        name: p.get(
            "beta",
            1
        )
        for name, p
        in portfolios.items()
    }

    return_score = minmax_score(
        returns,
        True
    )

    risk_score = minmax_score(
        risks,
        False
    )

    sharpe_score = minmax_score(
        sharpes,
        True
    )

    alpha_score = minmax_score(
        alphas,
        True
    )

    beta_score = (
        beta_suitability_score(
            betas,
            market_trend
        )
    )

    # MVEP netral
    if "MVEP" in portfolios:

        alpha_score[
            "MVEP"
        ] = 0.5

        beta_score[
            "MVEP"
        ] = 0.5

    # Dynamic weights
    if market_trend == "Bullish":

        weights = {
            "return": 0.30,
            "risk": 0.15,
            "sharpe": 0.25,
            "alpha": 0.15,
            "beta": 0.15
        }

    elif market_trend == "Bearish":

        weights = {
            "return": 0.15,
            "risk": 0.30,
            "sharpe": 0.20,
            "alpha": 0.15,
            "beta": 0.20
        }

    else:

        weights = {
            "return": 0.20,
            "risk": 0.25,
            "sharpe": 0.25,
            "alpha": 0.15,
            "beta": 0.15
        }

    scores = {}

    for name in portfolios:

        score = (
            weights["return"]
            * return_score[name]

            + weights["risk"]
            * risk_score[name]

            + weights["sharpe"]
            * sharpe_score[name]

            + weights["alpha"]
            * alpha_score[name]

            + weights["beta"]
            * beta_score[name]
        )

        scores[name] = round(
            score,
            4
        )

    best_method = max(
        scores,
        key=scores.get
    )

    return (
        best_method,
        scores,
        weights
    )