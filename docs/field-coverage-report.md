# Field Coverage Report — Website Survey Form

**Generated:** July 16, 2026
**File:** `index.html` (1717 lines, self-contained)
**Form:** `https://amworx.github.io/wp_intaker/`

---

## 1. Complete Field Inventory

### SECTION 1 — Hosting, Domain & Email (4 fields)
| # | Field Name | Type | Required | Values / Options | Price |
|---|---|---|---|---|---|
| 1 | `domain` | radio | no | I already have one / Yes, I need one / Not sure yet | +$14/yr |
| 1b | `domain_idea` | text | conditional | Free text (shown when domain=need/not-sure) | — |
| 2 | `hosting` | radio | no | I already have hosting / Yes, I need hosting / Not sure | +$48/yr |
| 3 | `email` | radio | no | No, I'll use Gmail/Yahoo / Yes, I need business email / Not sure | +$15/yr |
| 3b | `email_count` | select | conditional | 1,2,3,5 (shown when email=need) | $15×count |
| 4 | `setup_help` | radio | no | Yes, please handle everything / No, I'll do it myself | +$25 |

### SECTION 2 — About You & Your Business (5 fields → now 6 with confirm)
| # | Field Name | Type | Required | Values / Options | Price |
|---|---|---|---|---|---|
| 5 | `full_name` | text | **YES** | Free text | — |
| 6 | `business_name` | text | no | Free text | — |
| 7 | `client_email` | email | **YES** | Email format validated | — |
| 7b | `client_email_confirm` | email | **YES** | Must match `client_email` | — |
| 8 | `client_phone` | tel | no | Free text | — |
| 9 | `business_desc` | textarea | no | Multi-line text | — |

### SECTION 3 — Website Type & Pages (3 fields, 12 page checkboxes)
| # | Field Name | Type | Required | Values / Options | Price |
|---|---|---|---|---|---|
| 10 | `website_type` | radio | no | Simple Info($200), Business($300), Portfolio($250), Blog($250), Store small($450), Store large($600), Booking($400), Membership($450), Directory($500) |
| 11 | `page` (×12) | checkbox | no | Home($0), About($15), Services($15), Portfolio($20), Blog($20), Contact($0), FAQ($15), Testimonials($15), Gallery($20), Team($15), Pricing($15), Privacy($10) |
| 12 | `other_pages` | text | no | Free text | — |

### SECTION 4 — Features (1 field, 20 feature checkboxes)
| # | Field Name | Type | Required | Values / Options | Price |
|---|---|---|---|---|---|
| 13 | `feature` (×20) | checkbox | no | Contact Form($0), WhatsApp Button($15), Image Gallery($20), Hero Slider($20), Google Maps($10), Social Media Links($0), Newsletter($25), SEO Setup($40), Search Bar($15), Multi-Language($80), Members Area($60), Online Payments($50), Booking System($75), Events Calendar($40), Donations($30), Job Listings($40), Forum($60), Testimonials Widget($15), Cookie Consent($15), Analytics($20) |

### SECTION 5 — Design & Content (5 fields → now 6 with file upload)
| # | Field Name | Type | Required | Values / Options | Price |
|---|---|---|---|---|---|
| 14 | `logo` | radio | no | Yes, I need a logo(+$50) / I already have one / I'll figure it out | +$50 |
| 15 | `content_text` | radio | no | I'll write it myself / I need help(+$50) / I have it ready | +$50 |
| 16 | `content_photos` | radio | no | I have my own / Use free stock(+$30) / Not sure | +$30 |
| 17 | `brand_colors` | text | no | Free text | — |
| 18 | `inspiration_links` | text | no | Free text (URLs) | — |
| 19 | `file_upload` | file (multiple) | no | Images, PDFs, documents (max 10MB each) | — |

### SECTION 6 — Timeline & Maintenance (2 fields)
| # | Field Name | Type | Required | Values / Options | Price |
|---|---|---|---|---|---|
| 20 | `timeline` | radio | no | 1 week urgent(+$50) / 2 weeks / 1 month / Flexible | +$50 rush |
| 21 | `maintenance` | radio | no | No / Basic $25/mo / Standard $40/mo / Premium $60/mo | $25-60/mo |

### SECTION 7 — Budget & Extra (2 fields)
| # | Field Name | Type | Required | Values / Options | Price |
|---|---|---|---|---|---|
| 22 | `budget` | radio | no | $100-300 / $300-500 / $500-1000 / $1000+ / Not sure | — |
| 23 | `extra_notes` | textarea | no | Free text | — |

### HIDDEN
| # | Field Name | Type | Notes |
|---|---|---|---|
| H1 | `calculated_total` | hidden | Auto-populated by JS calculation engine |

**Total collected data points: 23 visible fields + 1 hidden + files**

---

## 2. Client Requirements Coverage Map

| Client Need | Covered? | Where / How |
|---|---|---|
| **Identity** (name, business) | ✅ | Section 2: `full_name`, `business_name` |
| **Contact** (email, phone) | ✅ | Section 2: `client_email` + confirm, `client_phone` |
| **Business description** | ✅ | Section 2: `business_desc` |
| **Domain** (need, existing) | ✅ | Section 1: `domain` + `domain_idea` |
| **Hosting** (need, existing) | ✅ | Section 1: `hosting` |
| **Business email** | ✅ | Section 1: `email` + `email_count` |
| **Technical setup help** | ✅ | Section 1: `setup_help` |
| **Website type / purpose** | ✅ | Section 3: `website_type` (9 types) |
| **Page list** | ✅ | Section 3: `page` (12 standard) + `other_pages` |
| **Feature selection** | ✅ | Section 4: `feature` (20 options) |
| **Logo** | ✅ | Section 5: `logo` |
| **Content writing** | ✅ | Section 5: `content_text` |
| **Photos / images** | ✅ | Section 5: `content_photos` |
| **Brand colors / style** | ✅ | Section 5: `brand_colors` |
| **Design inspiration** | ✅ | Section 5: `inspiration_links` |
| **File upload** (brand assets) | ✅ **NEW** | Section 5: `file_upload` (multiple, 10MB limit) |
| **Timeline / urgency** | ✅ | Section 6: `timeline` |
| **Maintenance** | ✅ | Section 6: `maintenance` (3 tiers) |
| **Budget** | ✅ | Section 7: `budget` |
| **Extra notes** | ✅ | Section 7: `extra_notes` |
| **Live price estimate** | ✅ | Sticky price bar + breakdown modal |
| **Email confirmation** (studio) | ✅ | FormSubmit.co → `amworxx@gmail.com` |
| **Email confirmation** (client) | ✅ | Separate FormSubmit POST → client's email |
| **Email validation** | ✅ **NEW** | Format regex + confirm match before submit |

---

## 3. Gaps Analysis — What's NOT Covered

### 🔴 Potential Gaps (recommended for future)
| Gap | Impact | Recommendation |
|---|---|---|
| **Existing website URL** | Medium — If client already has a site, knowing the URL gives context | Add conditional field when domain="I already have one" |
| **Current hosting provider** | Low — Helpful when migrating | Add conditional field when hosting="I already have hosting" |
| **Social media profiles** | Low — Useful for brand consistency | Add optional text field in Section 5 |
| **Target audience** | Low — Helps tailor design decisions | Add optional text field in Section 3 |
| **Competitor URLs** | Low — Provides competitive context | Add optional text field in Section 5 |
| **CMS/platform preference** | Low — Currently WordPress-only implied | Add note or radio in Section 4 |
| **Post-launch training** | Low — Additional service opportunity | Add checkbox in Section 6 |
| **Payment gateway choice** | Low — Only relevant for e-commerce | Could add to Section 4 |
| **Accessibility requirements** | Low — Niche need | Add note in Section 4 |

### ✅ Strengths (comprehensive coverage)
- **7 logical sections** covering the full project lifecycle
- **9 website types** from simple info to directory/catalog
- **20 features** with real-world WordPress-compatible options
- **3 maintenance tiers** for recurring revenue
- **Live pricing** with per-item breakdown modal
- **Dual email** delivery (studio + client) with different content
- **File uploads** for brand assets and reference materials
- **Email validation** with format check + confirmation field

---

## 4. Changes Made in This Update

| Change | Location | Purpose |
|---|---|---|
| **Confirm email field** | Section 2 | Catches typos in client email |
| **Email format validation** | JS submit handler | Validates `user@domain.tld` pattern |
| **Email mismatch check** | JS submit handler | Ensures both email fields match |
| **File upload input** | Section 5 | Accepts images, PDFs, docs (multiple) |
| **File name display** | JS UI | Shows selected files with remove button |
| **File attachment to POST** | JS submit handler | Attaches files to both studio + client emails |
| **File info in summary** | Summary text | Lists uploaded file names |
| **CSS for file upload** | Styles | Dashed dropzone, file list, remove buttons |

---

## 5. File Upload Details

- **Accepted formats:** `.jpg .jpeg .png .gif .webp .pdf .doc .docx .txt .ai .eps .svg .zip`
- **Max file size:** 10MB per file (enforced by FormSubmit.co limit)
- **Multiple files:** Yes (via `multiple` attribute)
- **Storage:** Files are sent as email attachments via FormSubmit.co (no server storage)
- **Limitation:** Files over 10MB will be rejected by FormSubmit. For larger files, advise client to use a cloud share link in the Extra Notes field.

---

## 6. Email Validation Details

| Check | Method | Error Message |
|---|---|---|
| Empty check | `if (!name \|\| !email)` | "Please fill in your name and a valid email address." |
| Format check | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | "Please enter a valid email address (e.g. name@domain.com)." |
| Confirm match | `email !== emailConfirm` | "Email addresses do not match." |

All three checks run sequentially before any data is sent. Submission stops at the first failing check.
