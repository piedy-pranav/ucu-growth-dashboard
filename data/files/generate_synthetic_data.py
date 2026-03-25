"""
Generate Synthetic Data for UCU Partnership Growth Analysis
============================================================
This script creates realistic synthetic data mirroring:
1. IPEDS enrollment/staffing data for UCU partner universities (2019-2024)
2. NCUA 5300 Call Report data for UCU (quarterly, 2019-2024)
3. Census/demographic data for campus metro areas

INSTRUCTIONS FOR REAL DATA:
- IPEDS: https://nces.ed.gov/ipeds/datacenter/InstitutionList.aspx
  → Select UCU partner schools → Download enrollment + HR components
- NCUA: https://ncua.gov/analysis/credit-union-corporate-call-report-data/quarterly-data
  → Download quarterly ZIPs → Filter for CU_Number = 67364 (UCU)
- Census: https://data.census.gov → median household income by metro area

Replace the CSVs this script generates with real downloads.
"""

import pandas as pd
import numpy as np
import os

np.random.seed(42)

# =============================================================================
# UCU PARTNER UNIVERSITIES (real IPEDS UNITIDs)
# =============================================================================
PARTNER_SCHOOLS = {
    110662: {"name": "UCLA", "city": "Los Angeles", "state": "CA", "type": "Public R1", "base_enrollment": 45000, "base_staff": 26000, "year_joined_ucu": 1951, "conference": "Founding"},
    117946: {"name": "Pepperdine University", "city": "Malibu", "state": "CA", "type": "Private", "base_enrollment": 9000, "base_staff": 2800, "year_joined_ucu": 2010, "conference": "WCC"},
    118140: {"name": "Loyola Marymount University", "city": "Los Angeles", "state": "CA", "type": "Private", "base_enrollment": 10000, "base_staff": 3200, "year_joined_ucu": 2012, "conference": "WCC"},
    122931: {"name": "Santa Clara University", "city": "Santa Clara", "state": "CA", "type": "Private", "base_enrollment": 9500, "base_staff": 2600, "year_joined_ucu": 2015, "conference": "WCC"},
    113698: {"name": "Saint Mary's College of California", "city": "Moraga", "state": "CA", "type": "Private", "base_enrollment": 3800, "base_staff": 1100, "year_joined_ucu": 2024, "conference": "WCC"},
    110653: {"name": "UC Irvine", "city": "Irvine", "state": "CA", "type": "Public R1", "base_enrollment": 36000, "base_staff": 18000, "year_joined_ucu": 2018, "conference": "UC System"},
    110644: {"name": "UC Davis", "city": "Davis", "state": "CA", "type": "Public R1", "base_enrollment": 40000, "base_staff": 22000, "year_joined_ucu": 2019, "conference": "UC System"},
    110680: {"name": "UC San Diego", "city": "San Diego", "state": "CA", "type": "Public R1", "base_enrollment": 42000, "base_staff": 20000, "year_joined_ucu": 2020, "conference": "UC System"},
    139755: {"name": "Georgia Institute of Technology", "city": "Atlanta", "state": "GA", "type": "Public R1", "base_enrollment": 44000, "base_staff": 14000, "year_joined_ucu": 2021, "conference": "Out-of-State"},
    228769: {"name": "University of Texas at Arlington", "city": "Arlington", "state": "TX", "type": "Public R1", "base_enrollment": 40000, "base_staff": 8000, "year_joined_ucu": 2024, "conference": "Out-of-State"},
    222178: {"name": "Abilene Christian University", "city": "Abilene", "state": "TX", "type": "Private", "base_enrollment": 5200, "base_staff": 1400, "year_joined_ucu": 2025, "conference": "WAC"},
    118699: {"name": "Mount Saint Mary's University", "city": "Los Angeles", "state": "CA", "type": "Private", "base_enrollment": 3200, "base_staff": 900, "year_joined_ucu": 2016, "conference": "LA Local"},
    112826: {"name": "Chabot College", "city": "Hayward", "state": "CA", "type": "Community College", "base_enrollment": 13000, "base_staff": 1200, "year_joined_ucu": 2014, "conference": "CC"},
    118888: {"name": "Las Positas College", "city": "Livermore", "state": "CA", "type": "Community College", "base_enrollment": 8500, "base_staff": 800, "year_joined_ucu": 2014, "conference": "CC"},
}

# =============================================================================
# 1. IPEDS ENROLLMENT DATA (2019-2024)
# =============================================================================
def generate_ipeds_enrollment():
    """Generate enrollment data mimicking IPEDS Fall Enrollment component."""
    rows = []
    years = range(2019, 2025)
    
    for unitid, info in PARTNER_SCHOOLS.items():
        base = info["base_enrollment"]
        for year in years:
            # COVID dip in 2020-2021, recovery 2022+
            if year == 2020:
                factor = np.random.uniform(0.93, 0.97)
            elif year == 2021:
                factor = np.random.uniform(0.95, 0.99)
            elif year == 2022:
                factor = np.random.uniform(1.00, 1.04)
            elif year == 2023:
                factor = np.random.uniform(1.02, 1.06)
            elif year == 2024:
                factor = np.random.uniform(1.03, 1.08)
            else:
                factor = 1.0
            
            total = int(base * factor)
            # Breakdown
            undergrad_pct = 0.75 if "R1" in info["type"] else (0.85 if info["type"] == "Private" else 0.95)
            undergrad = int(total * undergrad_pct * np.random.uniform(0.97, 1.03))
            graduate = total - undergrad
            
            ft_pct = 0.82 if info["type"] != "Community College" else 0.35
            full_time = int(total * ft_pct * np.random.uniform(0.96, 1.04))
            part_time = total - full_time
            
            rows.append({
                "unitid": unitid,
                "institution_name": info["name"],
                "year": year,
                "total_enrollment": total,
                "undergraduate": undergrad,
                "graduate": graduate,
                "full_time": full_time,
                "part_time": part_time,
                "city": info["city"],
                "state": info["state"],
                "institution_type": info["type"],
            })
    
    return pd.DataFrame(rows)


# =============================================================================
# 2. IPEDS HUMAN RESOURCES / STAFFING DATA (2019-2024)
# =============================================================================
def generate_ipeds_staff():
    """Generate staff counts mimicking IPEDS Human Resources component."""
    rows = []
    years = range(2019, 2025)
    
    for unitid, info in PARTNER_SCHOOLS.items():
        base = info["base_staff"]
        for year in years:
            factor = 1.0 + (year - 2019) * np.random.uniform(0.005, 0.02)
            if year == 2020:
                factor *= 0.97  # slight COVID reduction
            
            total_staff = int(base * factor)
            faculty = int(total_staff * np.random.uniform(0.25, 0.35))
            admin = int(total_staff * np.random.uniform(0.15, 0.20))
            other = total_staff - faculty - admin
            
            rows.append({
                "unitid": unitid,
                "institution_name": info["name"],
                "year": year,
                "total_staff": total_staff,
                "faculty": faculty,
                "administrative": admin,
                "other_staff": other,
            })
    
    return pd.DataFrame(rows)


# =============================================================================
# 3. NCUA CALL REPORT DATA FOR UCU (Quarterly, 2019-2024)
# =============================================================================
def generate_ncua_data():
    """Generate UCU quarterly financial data mimicking NCUA 5300 Call Report."""
    rows = []
    quarters = []
    for year in range(2019, 2025):
        for q in [1, 2, 3, 4]:
            quarters.append((year, q))
    
    # UCU baseline (approximate real figures)
    base_members = 38000
    base_assets = 420_000_000  # $420M
    base_loans = 280_000_000
    base_shares = 370_000_000  # deposits
    
    for i, (year, quarter) in enumerate(quarters):
        t = i / len(quarters)
        
        # Growth trajectory: slow 2019-2021, accelerating 2022+
        if year <= 2021:
            growth = 1.0 + t * 0.08
        else:
            growth = 1.0 + t * 0.15
        
        noise = np.random.uniform(0.98, 1.02)
        
        members = int(base_members * growth * noise)
        assets = int(base_assets * growth * noise * np.random.uniform(0.99, 1.01))
        loans = int(base_loans * growth * noise * np.random.uniform(0.97, 1.03))
        shares = int(base_shares * growth * noise * np.random.uniform(0.99, 1.01))
        
        net_income_ytd = int(np.random.uniform(800_000, 2_500_000) * (quarter / 4))
        
        rows.append({
            "cu_number": 67364,
            "cu_name": "UNIVERSITY CREDIT UNION",
            "year": year,
            "quarter": quarter,
            "period": f"{year}-Q{quarter}",
            "total_members": members,
            "total_assets": assets,
            "total_loans": loans,
            "total_shares_deposits": shares,
            "net_income_ytd": net_income_ytd,
            "member_growth_qoq": None,  # will calculate
        })
    
    df = pd.DataFrame(rows)
    df["member_growth_qoq"] = df["total_members"].pct_change() * 100
    return df


# =============================================================================
# 4. CENSUS / DEMOGRAPHIC DATA PER CAMPUS METRO
# =============================================================================
def generate_census_data():
    """Median household income and cost of living index per campus metro."""
    data = {
        "UCLA": {"metro": "Los Angeles-Long Beach-Anaheim, CA", "median_income": 82_000, "col_index": 166, "population_18_24": 1_200_000},
        "Pepperdine University": {"metro": "Los Angeles-Long Beach-Anaheim, CA", "median_income": 82_000, "col_index": 166, "population_18_24": 1_200_000},
        "Loyola Marymount University": {"metro": "Los Angeles-Long Beach-Anaheim, CA", "median_income": 82_000, "col_index": 166, "population_18_24": 1_200_000},
        "Mount Saint Mary's University": {"metro": "Los Angeles-Long Beach-Anaheim, CA", "median_income": 82_000, "col_index": 166, "population_18_24": 1_200_000},
        "Santa Clara University": {"metro": "San Jose-Sunnyvale-Santa Clara, CA", "median_income": 133_000, "col_index": 195, "population_18_24": 280_000},
        "Saint Mary's College of California": {"metro": "San Francisco-Oakland-Hayward, CA", "median_income": 120_000, "col_index": 179, "population_18_24": 350_000},
        "UC Irvine": {"metro": "Los Angeles-Long Beach-Anaheim, CA", "median_income": 82_000, "col_index": 166, "population_18_24": 1_200_000},
        "UC Davis": {"metro": "Sacramento-Roseville-Arden Arcade, CA", "median_income": 78_000, "col_index": 132, "population_18_24": 250_000},
        "UC San Diego": {"metro": "San Diego-Carlsbad, CA", "median_income": 85_000, "col_index": 152, "population_18_24": 380_000},
        "Georgia Institute of Technology": {"metro": "Atlanta-Sandy Springs-Roswell, GA", "median_income": 75_000, "col_index": 107, "population_18_24": 680_000},
        "University of Texas at Arlington": {"metro": "Dallas-Fort Worth-Arlington, TX", "median_income": 72_000, "col_index": 103, "population_18_24": 950_000},
        "Abilene Christian University": {"metro": "Abilene, TX", "median_income": 52_000, "col_index": 82, "population_18_24": 25_000},
        "Chabot College": {"metro": "San Francisco-Oakland-Hayward, CA", "median_income": 120_000, "col_index": 179, "population_18_24": 350_000},
        "Las Positas College": {"metro": "San Francisco-Oakland-Hayward, CA", "median_income": 120_000, "col_index": 179, "population_18_24": 350_000},
    }
    
    rows = []
    for school, info in data.items():
        rows.append({
            "institution_name": school,
            "metro_area": info["metro"],
            "median_household_income": info["median_income"],
            "cost_of_living_index": info["col_index"],
            "metro_population_18_24": info["population_18_24"],
        })
    
    return pd.DataFrame(rows)


# =============================================================================
# 5. UCU PARTNERSHIP METADATA
# =============================================================================
def generate_partnership_metadata():
    """Partnership details including year joined and conference affiliation."""
    rows = []
    for unitid, info in PARTNER_SCHOOLS.items():
        rows.append({
            "unitid": unitid,
            "institution_name": info["name"],
            "year_joined_ucu": info["year_joined_ucu"],
            "conference_affiliation": info["conference"],
            "city": info["city"],
            "state": info["state"],
            "institution_type": info["type"],
        })
    return pd.DataFrame(rows)


# =============================================================================
# MAIN: Generate all datasets
# =============================================================================
if __name__ == "__main__":
    output_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("Generating synthetic datasets...")
    
    enrollment = generate_ipeds_enrollment()
    enrollment.to_csv(os.path.join(output_dir, "ipeds_enrollment.csv"), index=False)
    print(f"  ✓ ipeds_enrollment.csv: {len(enrollment)} rows")
    
    staff = generate_ipeds_staff()
    staff.to_csv(os.path.join(output_dir, "ipeds_staff.csv"), index=False)
    print(f"  ✓ ipeds_staff.csv: {len(staff)} rows")
    
    ncua = generate_ncua_data()
    ncua.to_csv(os.path.join(output_dir, "ncua_ucu_quarterly.csv"), index=False)
    print(f"  ✓ ncua_ucu_quarterly.csv: {len(ncua)} rows")
    
    census = generate_census_data()
    census.to_csv(os.path.join(output_dir, "census_metro_demographics.csv"), index=False)
    print(f"  ✓ census_metro_demographics.csv: {len(census)} rows")
    
    partnerships = generate_partnership_metadata()
    partnerships.to_csv(os.path.join(output_dir, "ucu_partnerships.csv"), index=False)
    print(f"  ✓ ucu_partnerships.csv: {len(partnerships)} rows")
    
    print("\nDone! All synthetic data generated.")
    print("\nTO SWAP IN REAL DATA:")
    print("  1. Download IPEDS data from https://nces.ed.gov/ipeds/datacenter/")
    print("  2. Download NCUA data from https://ncua.gov/analysis/credit-union-corporate-call-report-data/quarterly-data")
    print("  3. Download Census data from https://data.census.gov")
    print("  4. Replace the CSVs in this folder, matching column names")
