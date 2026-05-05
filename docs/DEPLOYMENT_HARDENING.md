# Deployment Hardening Guide

Minimal, deterministic Cloudflare security configuration.

---

## 1. DNS and Workers

### DNS Records
| Type | Name | Proxy |
|------|------|-------|
| A | @ | Proxied |
| CNAME | www | Proxied |

### Workers Route
| Route | Worker |
|-------|--------|
| `yourdomain.com/api/*` | `distributor-api-worker` |

### D1 Binding
| Binding | Database |
|---------|----------|
| DB | `distributor-production-d1` |

### Secrets
| Name | Type |
|------|------|
| HELCIM_API_TOKEN | Secret |
| HELCIM_WEBHOOK_SECRET | Secret |
| SESSION_SECRET | Secret |

---

## 2. WAF Custom Rules

### Rule 1: Webhook IP Allowlist
| Field | Value |
|-------|-------|
| Name | `Webhook IP Allowlist` |
| Expression | `(http.request.uri.path eq "/api/webhooks/helcim") and not (ip.src in {199.167.248.0/24 199.167.249.0/24 199.167.250.0/24 199.167.251.0/24})` |
| Action | Block |

### Rule 2: Webhook POST Only
| Field | Value |
|-------|-------|
| Name | `Webhook POST Only` |
| Expression | `(http.request.uri.path eq "/api/webhooks/helcim") and not (http.request.method eq "POST")` |
| Action | Block |

### Rule 3: Webhook Content-Type Enforcement
| Field | Value |
|-------|-------|
| Name | `Webhook Content-Type Enforcement` |
| Expression | `(http.request.uri.path eq "/api/webhooks/helcim") and (http.request.method eq "POST") and not (lower(http.request.headers["content-type"][0]) contains "application/json")` |
| Action | Block |

### Rule 4: Auth POST Only
| Field | Value |
|-------|-------|
| Name | `Auth POST Only` |
| Expression | `(http.request.uri.path in {"/api/auth/login" "/api/auth/register" "/api/auth/logout"}) and not (http.request.method eq "POST")` |
| Action | Block |

### Rule 5: Payment POST Only
| Field | Value |
|-------|-------|
| Name | `Payment POST Only` |
| Expression | `(http.request.uri.path eq "/api/payment/create-session") and not (http.request.method eq "POST")` |
| Action | Block |

### Rule 6: Admin IP Allowlist
| Field | Value |
|-------|-------|
| Name | `Admin IP Allowlist` |
| Expression | `(http.request.uri.path starts_with "/admin") and not (ip.src in {OFFICE_IP_1/32 OFFICE_IP_2/32})` |
| Action | Block |

**Admin Access Requirement:** Admin routes require BOTH network-level (IP allowlist WAF rule above) AND identity-level (Zero Trust Access policy) protection. Configure Zero Trust Access application for `/admin/*` with email domain restriction (@yourcompany.com) and WARP client requirement.

---

## 3. Rate Limiting Rules

### Rule 1: Login Rate Limit
| Field | Value |
|-------|-------|
| Name | `Login Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/auth/login")` |
| Requests | 5 per 60 seconds |
| Action | Block 300 seconds |

### Rule 2: Login Burst Protection
| Field | Value |
|-------|-------|
| Name | `Login Burst Protection` |
| Expression | `(http.request.uri.path eq "/api/auth/login") and (http.request.method eq "POST")` |
| Requests | 3 per 10 seconds |
| Action | Block 300 seconds |

### Rule 3: Registration Rate Limit
| Field | Value |
|-------|-------|
| Name | `Registration Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/auth/register")` |
| Requests | 3 per 600 seconds |
| Action | Block 600 seconds |

### Rule 4: Payment Rate Limit
| Field | Value |
|-------|-------|
| Name | `Payment Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/payment/create-session")` |
| Requests | 10 per 60 seconds |
| Action | Block 300 seconds |

### Rule 5: Webhook Rate Limit
| Field | Value |
|-------|-------|
| Name | `Webhook Rate Limit` |
| Expression | `(http.request.uri.path eq "/api/webhooks/helcim")` |
| Requests | 10 per 60 seconds |
| Action | Block 60 seconds |

### Rule 6: Webhook Burst Protection
| Field | Value |
|-------|-------|
| Name | `Webhook Burst Protection` |
| Expression | `(http.request.uri.path eq "/api/webhooks/helcim") and (http.request.method eq "POST")` |
| Requests | 5 per 10 seconds |
| Action | Block 60 seconds |

### Rule 7: Global API Rate Limit
| Field | Value |
|-------|-------|
| Name | `Global API Rate Limit` |
| Expression | `(http.request.uri.path starts_with "/api/")` |
| Requests | 100 per 60 seconds |
| Action | Block 60 seconds |

---

## 4. Security Headers

### Transform Rule: Security Headers
| Header | Value |
|--------|-------|
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload` |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `DENY` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Content-Security-Policy | `default-src 'self'; script-src 'self' https://myhelcim.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.helcim.com https://myhelcim.com; frame-src https://myhelcim.com; frame-ancestors 'none'; base-uri 'self';` |

**CSP Exception:** `'unsafe-inline'` is allowed ONLY for `style-src`. This is a temporary requirement due to UI framework constraints (Tailwind CSS and React hydration inject inline styles). Removing causes visual breakage. `script-src` does NOT use `'unsafe-inline'` - this is critical for XSS protection.

### Remove Headers
| Header |
|--------|
| Server |
| X-Powered-By |

---

## 5. Logging

### Logpush Job
| Field | Value |
|-------|-------|
| Dataset | HTTP Requests |
| Destination | R2: `distributor-logs` |
| Filter | `ClientRequestPath starts_with "/api/"` |
| Retention | 90 days |

### Fields (minimal for incident response)
```
ClientIP, ClientRequestMethod, ClientRequestPath, EdgeResponseStatus, 
EdgeStartTimestamp, RayID, WAFAction, WAFRuleID, SecurityAction
```

---

## 6. Backup

### R2 Bucket
| Bucket | Retention |
|--------|-----------|
| `distributor-backups` | daily/7d, weekly/30d, monthly/365d |

### Backup Command
```bash
wrangler d1 export distributor-production-d1 --output="backup.sql"
wrangler r2 object put distributor-backups/$PREFIX/backup-$(date +%Y%m%d).sql --file="backup.sql"
```

### Restore Validation
```bash
wrangler d1 execute test-db --command "SELECT COUNT(*) FROM orders"
wrangler d1 execute test-db --command "SELECT COUNT(*) FROM payment_sessions"
wrangler d1 execute test-db --command "SELECT transaction_id, COUNT(*) FROM orders GROUP BY transaction_id HAVING COUNT(*) > 1"
# Last query must return 0 rows
```

---

## Quick Reference

| Rule | Path | Type | Action |
|------|------|------|--------|
| Webhook IP | `/api/webhooks/helcim` | WAF | Block non-Helcim |
| Webhook POST | `/api/webhooks/helcim` | WAF | Block non-POST |
| Webhook Content-Type | `/api/webhooks/helcim` | WAF | Block non-JSON |
| Auth POST | `/api/auth/*` | WAF | Block non-POST |
| Payment POST | `/api/payment/create-session` | WAF | Block non-POST |
| Admin IP | `/admin` | WAF | Block non-allowlist |
| Admin Identity | `/admin` | Zero Trust | Require identity |
| Login Rate | `/api/auth/login` | Rate | 5/min |
| Login Burst | `/api/auth/login` | Rate | 3/10sec |
| Register Rate | `/api/auth/register` | Rate | 3/10min |
| Payment Rate | `/api/payment/create-session` | Rate | 10/min |
| Webhook Rate | `/api/webhooks/helcim` | Rate | 10/min |
| Webhook Burst | `/api/webhooks/helcim` | Rate | 5/10sec |
| Global API | `/api/*` | Rate | 100/min |
