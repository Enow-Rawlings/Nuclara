-- =============================================================================
-- Seed 002: Demo products
-- DEVELOPMENT ONLY — never publish to production.
-- All descriptions use neutral research-context language only.
-- No dosage, therapeutic, human-use, or efficacy claims.
-- compliance_status = 'not_submitted' — nothing is pre-approved.
--
-- UUID scheme: a00X0000-0000-0000-0000-000000000001 through ...0020
-- (all hex-valid: uses only 0-9 and a-f)
-- =============================================================================

INSERT INTO products (
  id, name, slug, sku,
  short_description, long_description,
  price, currency,
  status, compliance_status,
  stock_quantity, low_stock_threshold, is_visible
) VALUES

-- ── Research Peptides ─────────────────────────────────────────────────────────

(
  'a0010000-0000-0000-0000-000000000001',
  'BPC-157 (5mg)',
  'bpc-157-5mg',
  'NUC-BPC157-5',
  'Body Protection Compound 157. Synthetic pentadecapeptide. 5 mg vial. Research use only.',
  'BPC-157 is a synthetic pentadecapeptide derived from a protective protein found in gastric juice. Supplied as a lyophilised powder for research purposes. This product is intended solely for laboratory and in-vitro research. It is not intended for human or veterinary use, and no therapeutic claims are made or implied.',
  42.00, 'EUR',
  'published', 'not_submitted',
  150, 10, TRUE
),
(
  'a0020000-0000-0000-0000-000000000002',
  'BPC-157 (10mg)',
  'bpc-157-10mg',
  'NUC-BPC157-10',
  'Body Protection Compound 157. Synthetic pentadecapeptide. 10 mg vial. Research use only.',
  'BPC-157 10 mg is a higher-quantity research vial of the synthetic pentadecapeptide. Supplied as lyophilised powder. Intended for laboratory research only. No human or veterinary use. No therapeutic claims made or implied.',
  74.00, 'EUR',
  'published', 'not_submitted',
  80, 8, TRUE
),
(
  'a0030000-0000-0000-0000-000000000003',
  'TB-500 (5mg)',
  'tb-500-5mg',
  'NUC-TB500-5',
  'Thymosin Beta-4 fragment. 5 mg vial. Research use only.',
  'TB-500 is a synthetic version of a portion of Thymosin Beta-4. Supplied as lyophilised powder for in-vitro and laboratory research. Not intended for human or animal use. No health or therapeutic claims are made.',
  48.00, 'EUR',
  'published', 'not_submitted',
  120, 10, TRUE
),
(
  'a0040000-0000-0000-0000-000000000004',
  'TB-500 (10mg)',
  'tb-500-10mg',
  'NUC-TB500-10',
  'Thymosin Beta-4 fragment. 10 mg vial. Research use only.',
  'TB-500 10 mg research vial. Lyophilised powder. Laboratory use only. No human, veterinary, or therapeutic use intended or implied.',
  86.00, 'EUR',
  'published', 'not_submitted',
  60, 5, TRUE
),
(
  'a0050000-0000-0000-0000-000000000005',
  'PT-141 (10mg)',
  'pt-141-10mg',
  'NUC-PT141-10',
  'Bremelanotide. Melanocortin receptor research compound. 10 mg vial.',
  'PT-141 (Bremelanotide) is a synthetic melanocortin receptor ligand used in receptor-binding and pharmacological research. Supplied as lyophilised powder. For research purposes only. Not for human or animal use.',
  58.00, 'EUR',
  'published', 'not_submitted',
  90, 8, TRUE
),

-- ── Growth Factor Peptides ────────────────────────────────────────────────────

(
  'a0060000-0000-0000-0000-000000000006',
  'IGF-1 LR3 (1mg)',
  'igf-1-lr3-1mg',
  'NUC-IGF1LR3-1',
  'Insulin-like Growth Factor-1 Long R3. 1 mg vial. Research use only.',
  'IGF-1 LR3 is a recombinant analogue of Insulin-like Growth Factor 1 with an extended half-life compared to native IGF-1. Used in cell culture and growth-factor signalling research. Not for human or animal administration.',
  89.00, 'EUR',
  'published', 'not_submitted',
  45, 5, TRUE
),
(
  'a0070000-0000-0000-0000-000000000007',
  'MGF (2mg)',
  'mgf-2mg',
  'NUC-MGF-2',
  'Mechano Growth Factor. 2 mg vial. Research use only.',
  'MGF (Mechano Growth Factor) is an alternatively spliced form of IGF-1 studied in skeletal muscle and tissue research. Lyophilised powder, 2 mg per vial. Research use only. No therapeutic or human-use claims.',
  54.00, 'EUR',
  'published', 'not_submitted',
  70, 6, TRUE
),
(
  'a0080000-0000-0000-0000-000000000008',
  'GHRP-6 (5mg)',
  'ghrp-6-5mg',
  'NUC-GHRP6-5',
  'Growth Hormone Releasing Peptide-6. 5 mg vial. Research use only.',
  'GHRP-6 is a synthetic hexapeptide that acts as a ghrelin receptor agonist. Used in endocrine and receptor pharmacology research. Supplied as lyophilised powder. Not for human or veterinary use.',
  38.00, 'EUR',
  'published', 'not_submitted',
  110, 10, TRUE
),
(
  'a0090000-0000-0000-0000-000000000009',
  'GHRP-2 (5mg)',
  'ghrp-2-5mg',
  'NUC-GHRP2-5',
  'Growth Hormone Releasing Peptide-2. 5 mg vial. Research use only.',
  'GHRP-2 is a synthetic hexapeptide ghrelin receptor agonist. Used in in-vitro receptor studies and growth hormone secretagogue research. Not for human or animal use.',
  38.00, 'EUR',
  'published', 'not_submitted',
  100, 10, TRUE
),
(
  'a00a0000-0000-0000-0000-00000000000a',
  'CJC-1295 (2mg)',
  'cjc-1295-2mg',
  'NUC-CJC1295-2',
  'CJC-1295 without DAC. GHRH analogue. 2 mg vial. Research use only.',
  'CJC-1295 (without DAC) is a synthetic analogue of Growth Hormone Releasing Hormone. Used in studies of the GH/IGF-1 axis and receptor pharmacology. Lyophilised powder, 2 mg. Research use only.',
  46.00, 'EUR',
  'published', 'not_submitted',
  85, 8, TRUE
),

-- ── Cosmetic Peptides ─────────────────────────────────────────────────────────

(
  'a00b0000-0000-0000-0000-00000000000b',
  'Argireline (50mg)',
  'argireline-50mg',
  'NUC-ARG-50',
  'Acetyl Hexapeptide-3. 50 mg. Cosmetic research grade.',
  'Argireline (Acetyl Hexapeptide-3) is a synthetic peptide used in cosmetic formulation research. Supplied as a lyophilised powder, 50 mg. For formulation development and in-vitro testing. Not a finished cosmetic product.',
  29.00, 'EUR',
  'published', 'not_submitted',
  200, 20, TRUE
),
(
  'a00c0000-0000-0000-0000-00000000000c',
  'Matrixyl 3000 Blend (100mg)',
  'matrixyl-3000-100mg',
  'NUC-MAT3K-100',
  'Palmitoyl Tripeptide-1 / Tetrapeptide-7 blend. 100 mg. Cosmetic research.',
  'Matrixyl 3000 is a blend of Palmitoyl Tripeptide-1 and Palmitoyl Tetrapeptide-7, widely used in dermatological and cosmetic active-ingredient research. 100 mg research sample. Not a finished consumer product.',
  52.00, 'EUR',
  'published', 'not_submitted',
  130, 10, TRUE
),
(
  'a00d0000-0000-0000-0000-00000000000d',
  'Copper Peptide GHK-Cu (50mg)',
  'ghk-cu-50mg',
  'NUC-GHKCU-50',
  'Glycine-Histidine-Lysine Copper complex. 50 mg. Research grade.',
  'GHK-Cu is a naturally occurring copper complex involved in tissue remodelling research. Used in dermatological and wound-healing in-vitro studies. 50 mg lyophilised powder. Research use only.',
  35.00, 'EUR',
  'published', 'not_submitted',
  175, 15, TRUE
),

-- ── Nootropic Peptides ────────────────────────────────────────────────────────

(
  'a00e0000-0000-0000-0000-00000000000e',
  'Semax (30mg)',
  'semax-30mg',
  'NUC-SEMAX-30',
  'ACTH 4-7 Pro8Gly9Pro10 analogue. 30 mg. Research use only.',
  'Semax is a synthetic heptapeptide analogue of ACTH fragments, studied for its effects on neurotrophic factor expression and neurological research models. Supplied as lyophilised powder. Not for human use.',
  62.00, 'EUR',
  'published', 'not_submitted',
  55, 5, TRUE
),
(
  'a00f0000-0000-0000-0000-00000000000f',
  'Selank (30mg)',
  'selank-30mg',
  'NUC-SELANK-30',
  'Tuftsin analogue heptapeptide. 30 mg. Research use only.',
  'Selank is a synthetic analogue of the immunomodulatory peptide Tuftsin. Used in anxiety and neurological pathway research. Lyophilised powder, 30 mg. Not intended for human or veterinary use.',
  58.00, 'EUR',
  'published', 'not_submitted',
  60, 5, TRUE
),
(
  'a0100000-0000-0000-0000-000000000010',
  'Dihexa (50mg)',
  'dihexa-50mg',
  'NUC-DIHEXA-50',
  'Hepatocyte Growth Factor activator peptide. 50 mg. Research use only.',
  'Dihexa is a small peptide derived from Angiotensin IV, studied for its activity on hepatocyte growth factor signalling pathways in neurological research contexts. Research use only. No cognitive or therapeutic claims implied.',
  118.00, 'EUR',
  'published', 'not_submitted',
  30, 3, TRUE
),

-- ── Analgesic Peptides ────────────────────────────────────────────────────────

(
  'a0110000-0000-0000-0000-000000000011',
  'Ziconotide Analogue (1mg)',
  'ziconotide-analogue-1mg',
  'NUC-ZICO-1',
  'Synthetic conotoxin-derived peptide analogue. 1 mg. Research use only.',
  'A synthetic analogue of conotoxin peptides used in ion-channel and pain-pathway research models. 1 mg lyophilised powder. Not for human use. Requires appropriate laboratory safety measures.',
  145.00, 'EUR',
  'published', 'not_submitted',
  25, 3, TRUE
),
(
  'a0120000-0000-0000-0000-000000000012',
  'Dermorphin (1mg)',
  'dermorphin-1mg',
  'NUC-DERM-1',
  'Naturally occurring opioid heptapeptide. 1 mg. Research use only.',
  'Dermorphin is a naturally occurring heptapeptide isolated from amphibian skin, used in opioid receptor research. 1 mg per vial. Research use only. Subject to applicable controlled-substance regulations per jurisdiction.',
  95.00, 'EUR',
  'draft', 'not_submitted',
  20, 3, FALSE
),

-- ── Additional research peptides ──────────────────────────────────────────────

(
  'a0130000-0000-0000-0000-000000000013',
  'LL-37 (5mg)',
  'll-37-5mg',
  'NUC-LL37-5',
  'Human cathelicidin antimicrobial peptide. 5 mg. Research use only.',
  'LL-37 is the C-terminal fragment of the human cathelicidin precursor hCAP-18. Used in antimicrobial peptide and innate immunity research. 5 mg lyophilised powder. Not for human administration.',
  78.00, 'EUR',
  'published', 'not_submitted',
  40, 4, TRUE
),
(
  'a0140000-0000-0000-0000-000000000014',
  'Epitalon (10mg)',
  'epitalon-10mg',
  'NUC-EPIT-10',
  'Tetrapeptide Ala-Glu-Asp-Gly. 10 mg. Research use only.',
  'Epitalon (Epithalon) is a synthetic tetrapeptide studied in telomere and pineal gland research contexts. 10 mg lyophilised powder. For research use only. No anti-ageing or therapeutic claims are made or implied.',
  56.00, 'EUR',
  'published', 'not_submitted',
  95, 8, TRUE
)

ON CONFLICT (slug) DO NOTHING;
