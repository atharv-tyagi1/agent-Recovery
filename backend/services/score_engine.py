def calculate_score(vulns: list) -> dict:
    score = 100
    
    # Deductions
    deductions = {
        "critical": 20,
        "high": 10,
        "medium": 5,
        "low": 2
    }
    
    for v in vulns:
        score -= deductions.get(v.get('severity', 'low').lower(), 0)
        
    score_before = max(0, score)
    
    # Assuming all fixes are applied, the after score is 100,
    # but we can simulate a bit realistically.
    score_after = min(100, score_before + sum([deductions.get(v.get('severity', 'low').lower(), 0) for v in vulns]))
    
    # If 100 before, 100 after.
    if score_before == 100:
        score_after = 100
        
    risk_reduction = score_after - score_before
    
    return {
        "score_before": score_before,
        "score_after": score_after,
        "risk_reduction": risk_reduction,
        "threat_reduction": min(100, risk_reduction + 5) if risk_reduction > 0 else 0
    }
