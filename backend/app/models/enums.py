"""Shared enumerations for the domain model."""
from enum import Enum


class UserRole(str, Enum):
    CITIZEN = "citizen"        # Fuqaro
    JUDGE = "judge"            # Sudya
    LAWYER = "lawyer"          # Advokat
    ADMIN = "admin"            # Administrator
    OVERSIGHT = "oversight"    # Nazorat / Ijro xodimi


class DisputeType(str, Enum):
    CIVIL = "civil"            # Fuqarolik nizosi
    LABOR = "labor"            # Mehnat nizosi
    ECONOMIC = "economic"      # Iqtisodiy nizo
    FAMILY = "family"          # Oilaviy nizo
    ADMINISTRATIVE = "administrative"  # Ma'muriy huquqbuzarlik
    CRIMINAL = "criminal"      # Jinoiy ish
    PROPERTY = "property"      # Mol-mulk nizosi
    OTHER = "other"            # Boshqa


class ClaimStatus(str, Enum):
    DRAFT = "draft"                    # Qoralama
    SUBMITTED = "submitted"            # Yuborilgan
    VALIDATING = "validating"          # AI tekshirmoqda (ClaimValidator)
    NEEDS_REVISION = "needs_revision"  # Kamchilik bor
    ACCEPTED = "accepted"              # Sudga qabul qilindi
    MEDIATION = "mediation"            # Mediatsiyada (MediatoBot)
    REJECTED = "rejected"              # Rad etildi


class CaseStatus(str, Enum):
    OPEN = "open"              # Ochiq
    IN_HEARING = "in_hearing"  # Sud jarayonida
    PENDING = "pending"        # Kutilmoqda
    DECIDED = "decided"        # Qaror chiqarildi
    EXECUTION = "execution"    # Ijroda (AutoExec)
    CLOSED = "closed"          # Yopilgan


class DocumentKind(str, Enum):
    CLAIM_PDF = "claim_pdf"
    EVIDENCE = "evidence"
    DECISION = "decision"
    PROTOCOL = "protocol"
    AUDIO = "audio"
    VIDEO = "video"
    IMAGE = "image"
    OTHER = "other"
