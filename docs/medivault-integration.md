# MediVault Integration Guide

This document details the MediVault-specific requirements for the Client Portal (`apps/client-portal`).

## Pricing Tiers (Doctor Sign-Up)

### Basic
- **Price**: PKR 2,490 / month
- **Target**: Simple platform access.
- **Features**:
  - Patient profile management
  - Platform tools
  - Record viewing
  - Standard security
  - Email support
  - *Storage not included.*

### Standard (Most Popular)
- **Regular Price**: PKR 4,750 / month
- **Early Adopter Access**: PKR 3,990 / month
- **Features**:
  - Everything in Basic
  - Secure patient record storage
  - Advanced search (retrieval)
  - Doctor dashboard & insights
  - Priority support
- **Branding**: "Founding Doctor" / "Early Adopter" badge.

### Premium
- **Regular Price**: PKR 6,700 / month
- **Early Adopter Access**: PKR 5,490 / month
- **Features**:
  - Everything in Standard
  - AI-powered medical record assistance
  - Smart document organization
  - Predictive patient insights
  - Higher storage capacity
  - Priority infrastructure & support

## UI Components (Client Portal)

### 1. Plan Status Card
- **Location**: Top of clinic dashboard.
- **Content**: Plan name, Price (locking in early adopter price), Next billing date.
- **Action**: "Manage Subscription" button.

### 2. Billing Section (Settings)
- **Path**: `apps.nextwave.au/medivault/settings/billing`
- **Content**: Detailed plan breakdown, benefit list.
- **Actions**: "Upgrade to Premium", "Manage Billing".

### 3. Premium Upsell Box
- **Content**: Highlight AI and Predictive features for Premium.
- **Action**: "Upgrade Plan" button.

### 4. Billing History
- **Format**: Table showing Date, Plan (with badge), and Amount.

## Superuser Controls (Admin Dashboard)
- **Location**: `admin.nextwave.au`
- **Capabilities**:
  - Generate Stripe discount codes (for early adopter pricing).
  - Apply coupons to customer accounts.
  - **Usage Oversight**: View real-time row counts (`patients`, `visits`) and storage usage (`letterheads`, `visit-reports`) per clinic. This data serves as the baseline for recommending tier upgrades.
  - Manage user access "Twists" (modifying roles/permissions).
  - Global overview of all clinic subscriptions.
