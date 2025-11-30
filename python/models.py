from sqlalchemy import Column, BigInteger, Date, String, SmallInteger, Integer, Time, Numeric, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel, Field
from datetime import date, time
from typing import Optional
from decimal import Decimal

Base = declarative_base()

class Affectation(Base):
    __tablename__ = 'affectations'

    affectation_id = Column(BigInteger, primary_key=True, autoincrement=True)
    date_jour = Column(Date, nullable=False)
    equip_id = Column(String(20), ForeignKey('equipements.equip_id'), nullable=False)
    chantier_id = Column(String(20), ForeignKey('chantiers.chantier_id'), nullable=False)
    activite_id = Column(String(20), ForeignKey('activites.activite_id'), nullable=False)
    bloc_affectation = Column(SmallInteger, nullable=False, default=1)
    operateur_id = Column(Integer, ForeignKey('employes.employe_id'))
    operateur_nom = Column(String(200))
    heure_debut = Column(Time)
    heure_fin = Column(Time)
    heure_jour = Column(Numeric(10, 2))
    km_jour = Column(Numeric(10, 1))
    carburant_litres = Column(Numeric(10, 2))
    coutusage_calc_lei = Column(Numeric(14, 2))
    coutoperateur_calc_lei = Column(Numeric(14, 2))
    etat_saisie_code = Column(String(20), ForeignKey('etat_saisie.code'))
    motif_jour_id = Column(String(10), ForeignKey('motif_jour.motif_jour_id'))
    notes = Column(Text)

class AffectationModel(BaseModel):
    affectation_id: Optional[int] = None
    date_jour: date
    equip_id: str = Field(..., max_length=20)
    chantier_id: str = Field(..., max_length=20)
    activite_id: str = Field(..., max_length=20)
    bloc_affectation: int = 1
    operateur_id: Optional[int] = None
    operateur_nom: Optional[str] = Field(None, max_length=200)
    heure_debut: Optional[time] = None
    heure_fin: Optional[time] = None
    heure_jour: Optional[Decimal] = None
    km_jour: Optional[Decimal] = None
    carburant_litres: Optional[Decimal] = None
    coutusage_calc_lei: Optional[Decimal] = None
    coutoperateur_calc_lei: Optional[Decimal] = None
    etat_saisie_code: Optional[str] = Field(None, max_length=20)
    motif_jour_id: Optional[str] = Field(None, max_length=10)
    notes: Optional[str] = None

    class Config:
        orm_mode = True
