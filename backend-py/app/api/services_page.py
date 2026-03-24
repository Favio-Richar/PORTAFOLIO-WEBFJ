import json
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db import get_session
from app.models import (
    AdditionalService,
    Faq,
    ProfessionalPlan,
    Review,
    ServiceCombo,
    ServiceComboDiagnosticCard,
    ServiceComboHighlightCard,
    ServiceAdvisoryCard,
    ServiceIndustry,
    ServiceMarqueeCard,
    TeamMember,
)
from app.core.admin_auth import require_admin

router = APIRouter()


def _as_json_list(value: Optional[str]) -> str:
    if value is None:
        return "[]"
    trimmed = str(value).strip()
    if not trimmed:
        return "[]"

    try:
        parsed = json.loads(trimmed)
        if isinstance(parsed, list):
            return json.dumps(parsed, ensure_ascii=False)
    except (json.JSONDecodeError, TypeError, ValueError):
        pass

    pieces = [part.strip() for part in trimmed.replace("\n", ",").split(",") if part.strip()]
    return json.dumps(pieces, ensure_ascii=False)


class ReviewCreate(BaseModel):
    author_name: str
    content: str
    rating: int
    author_role: str | None = None
    author_company: str | None = None
    page_context: str | None = None


class ReviewUpdate(BaseModel):
    status: str | None = None
    content: str | None = None
    author_name: str | None = None
    author_role: str | None = None
    author_company: str | None = None
    page_context: str | None = None


class PlanCreate(BaseModel):
    name: str
    description: str
    modules: Optional[str] = None
    price: str
    includes: Optional[str] = None
    delivery: Optional[str] = None
    ideal_for: Optional[str] = None
    category: Optional[str] = None
    order_index: int = 0


class PlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    modules: Optional[str] = None
    price: Optional[str] = None
    includes: Optional[str] = None
    delivery: Optional[str] = None
    ideal_for: Optional[str] = None
    category: Optional[str] = None
    order_index: Optional[int] = None


class AdditionalServiceCreate(BaseModel):
    name: str
    description: str
    price: str
    icon: Optional[str] = None
    color: Optional[str] = None
    includes: Optional[str] = None
    recurring: bool = False
    payment_type: Optional[str] = "one-time"


class AdditionalServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    includes: Optional[str] = None
    recurring: Optional[bool] = None
    payment_type: Optional[str] = None


class ComboCreate(BaseModel):
    title: str
    segment: str = "PYMEs"
    ideal: str
    includes: Optional[str] = None
    individual_value: str
    combo_price: str
    note: str
    deliverables: Optional[str] = None
    timeline: str
    not_included: Optional[str] = None
    market_note: Optional[str] = None
    order_index: int = 0
    active: bool = True


class ComboUpdate(BaseModel):
    title: Optional[str] = None
    segment: Optional[str] = None
    ideal: Optional[str] = None
    includes: Optional[str] = None
    individual_value: Optional[str] = None
    combo_price: Optional[str] = None
    note: Optional[str] = None
    deliverables: Optional[str] = None
    timeline: Optional[str] = None
    not_included: Optional[str] = None
    market_note: Optional[str] = None
    order_index: Optional[int] = None
    active: Optional[bool] = None


class ComboDiagnosticCardCreate(BaseModel):
    badge: str
    title: str
    description: str
    needs_label: str = "Generalmente necesitas"
    needs: Optional[str] = None
    recommendations_label: str = "Te recomendamos"
    recommendations_text: str
    cta_text: str
    cta_href: str
    theme: str = "emerald"
    order_index: int = 0
    active: bool = True


class ComboDiagnosticCardUpdate(BaseModel):
    badge: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    needs_label: Optional[str] = None
    needs: Optional[str] = None
    recommendations_label: Optional[str] = None
    recommendations_text: Optional[str] = None
    cta_text: Optional[str] = None
    cta_href: Optional[str] = None
    theme: Optional[str] = None
    order_index: Optional[int] = None
    active: Optional[bool] = None


class ComboHighlightCardCreate(BaseModel):
    title: str
    description: str
    items: Optional[str] = None
    footer_note: Optional[str] = None
    theme: str = "emerald"
    order_index: int = 0
    active: bool = True


class ComboHighlightCardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    items: Optional[str] = None
    footer_note: Optional[str] = None
    theme: Optional[str] = None
    order_index: Optional[int] = None
    active: Optional[bool] = None


class AdvisoryServiceCreate(BaseModel):
    title: str
    price: str
    duration: Optional[str] = "60 minutos"
    audience: Optional[str] = "[]"
    includes: Optional[str] = "[]"
    result: str
    market_note: Optional[str] = None
    icon: Optional[str] = "briefcase"
    order_index: int = 0
    active: bool = True


class AdvisoryServiceUpdate(BaseModel):
    title: Optional[str] = None
    price: Optional[str] = None
    duration: Optional[str] = None
    audience: Optional[str] = None
    includes: Optional[str] = None
    result: Optional[str] = None
    market_note: Optional[str] = None
    icon: Optional[str] = None
    order_index: Optional[int] = None
    active: Optional[bool] = None


class FaqCreate(BaseModel):
    question: str
    answer: str
    category: Optional[str] = "General"
    active: bool = True
    order: int = 0


class FaqUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    active: Optional[bool] = None
    order: Optional[int] = None


class ServiceIndustryCreate(BaseModel):
    name: str
    description: str
    icon: Optional[str] = "briefcase"
    examples: Optional[str] = "[]"
    order_index: int = 0
    active: bool = True


class ServiceIndustryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    examples: Optional[str] = None
    order_index: Optional[int] = None
    active: Optional[bool] = None


class ServiceMarqueeCardCreate(BaseModel):
    title: str
    image_url: str
    order_index: int = 0
    active: bool = True


class ServiceMarqueeCardUpdate(BaseModel):
    title: Optional[str] = None
    image_url: Optional[str] = None
    order_index: Optional[int] = None
    active: Optional[bool] = None


@router.get("/plans", response_model=List[ProfessionalPlan])
def get_plans(session: Session = Depends(get_session)):
    return session.exec(select(ProfessionalPlan).order_by(ProfessionalPlan.order_index, ProfessionalPlan.id)).all()


@router.post("/plans", response_model=ProfessionalPlan)
def create_plan(
    payload: PlanCreate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    plan = ProfessionalPlan(
        name=payload.name.strip(),
        description=payload.description.strip(),
        modules=(payload.modules or "").strip() or None,
        price=payload.price.strip(),
        includes=_as_json_list(payload.includes),
        delivery=_as_json_list(payload.delivery),
        ideal_for=_as_json_list(payload.ideal_for),
        category=(payload.category or "").strip() or None,
        order_index=payload.order_index,
    )
    session.add(plan)
    session.commit()
    session.refresh(plan)
    return plan


@router.put("/plans/{plan_id}", response_model=ProfessionalPlan)
def update_plan(
    plan_id: int,
    payload: PlanUpdate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    plan = session.get(ProfessionalPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if key in {"includes", "delivery", "ideal_for"}:
            setattr(plan, key, _as_json_list(value))
        elif isinstance(value, str):
            setattr(plan, key, value.strip())
        else:
            setattr(plan, key, value)

    session.add(plan)
    session.commit()
    session.refresh(plan)
    return plan


@router.delete("/plans/{plan_id}")
def delete_plan(
    plan_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    plan = session.get(ProfessionalPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    session.delete(plan)
    session.commit()
    return {"ok": True}


@router.get("/additional-services", response_model=List[AdditionalService])
def get_additional_services(session: Session = Depends(get_session)):
    return session.exec(select(AdditionalService).order_by(AdditionalService.id)).all()


@router.post("/additional-services", response_model=AdditionalService)
def create_additional_service(
    payload: AdditionalServiceCreate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    service = AdditionalService(
        name=payload.name.strip(),
        description=payload.description.strip(),
        price=payload.price.strip(),
        icon=(payload.icon or "").strip() or None,
        color=(payload.color or "").strip() or None,
        includes=_as_json_list(payload.includes),
        recurring=payload.recurring,
        payment_type=(payload.payment_type or "").strip() or "one-time",
    )
    session.add(service)
    session.commit()
    session.refresh(service)
    return service


@router.put("/additional-services/{service_id}", response_model=AdditionalService)
def update_additional_service(
    service_id: int,
    payload: AdditionalServiceUpdate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    service = session.get(AdditionalService, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servicio adicional no encontrado")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if key == "includes":
            setattr(service, key, _as_json_list(value))
        elif isinstance(value, str):
            setattr(service, key, value.strip())
        else:
            setattr(service, key, value)

    session.add(service)
    session.commit()
    session.refresh(service)
    return service


@router.delete("/additional-services/{service_id}")
def delete_additional_service(
    service_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    service = session.get(AdditionalService, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servicio adicional no encontrado")
    session.delete(service)
    session.commit()
    return {"ok": True}


@router.get("/combos", response_model=List[ServiceCombo])
def get_combos(session: Session = Depends(get_session)):
    return session.exec(
        select(ServiceCombo)
        .where(ServiceCombo.active == True)
        .order_by(ServiceCombo.order_index, ServiceCombo.id)
    ).all()


@router.get("/combos/admin", response_model=List[ServiceCombo])
def get_combos_admin(
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    return session.exec(select(ServiceCombo).order_by(ServiceCombo.order_index, ServiceCombo.id)).all()


@router.post("/combos", response_model=ServiceCombo)
def create_combo(
    payload: ComboCreate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    combo = ServiceCombo(
        title=payload.title.strip(),
        segment=(payload.segment or "").strip() or "PYMEs",
        ideal=payload.ideal.strip(),
        includes=_as_json_list(payload.includes),
        individual_value=payload.individual_value.strip(),
        combo_price=payload.combo_price.strip(),
        note=payload.note.strip(),
        deliverables=_as_json_list(payload.deliverables),
        timeline=payload.timeline.strip(),
        not_included=_as_json_list(payload.not_included),
        market_note=(payload.market_note or "").strip() or None,
        order_index=payload.order_index,
        active=payload.active,
    )
    session.add(combo)
    session.commit()
    session.refresh(combo)
    return combo


@router.put("/combos/{combo_id}", response_model=ServiceCombo)
def update_combo(
    combo_id: int,
    payload: ComboUpdate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    combo = session.get(ServiceCombo, combo_id)
    if not combo:
        raise HTTPException(status_code=404, detail="Combo no encontrado")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if key in {"includes", "deliverables", "not_included"}:
            setattr(combo, key, _as_json_list(value))
        elif isinstance(value, str):
            setattr(combo, key, value.strip())
        else:
            setattr(combo, key, value)

    session.add(combo)
    session.commit()
    session.refresh(combo)
    return combo


@router.delete("/combos/{combo_id}")
def delete_combo(
    combo_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    combo = session.get(ServiceCombo, combo_id)
    if not combo:
        raise HTTPException(status_code=404, detail="Combo no encontrado")
    session.delete(combo)
    session.commit()
    return {"ok": True}


@router.get("/combo-diagnostic-cards", response_model=List[ServiceComboDiagnosticCard])
def get_combo_diagnostic_cards(session: Session = Depends(get_session)):
    return session.exec(
        select(ServiceComboDiagnosticCard)
        .where(ServiceComboDiagnosticCard.active == True)
        .order_by(ServiceComboDiagnosticCard.order_index, ServiceComboDiagnosticCard.id)
    ).all()


@router.get("/combo-diagnostic-cards/admin", response_model=List[ServiceComboDiagnosticCard])
def get_combo_diagnostic_cards_admin(
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    return session.exec(
        select(ServiceComboDiagnosticCard).order_by(
            ServiceComboDiagnosticCard.order_index, ServiceComboDiagnosticCard.id
        )
    ).all()


@router.post("/combo-diagnostic-cards", response_model=ServiceComboDiagnosticCard)
def create_combo_diagnostic_card(
    payload: ComboDiagnosticCardCreate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    item = ServiceComboDiagnosticCard(
        badge=payload.badge.strip(),
        title=payload.title.strip(),
        description=payload.description.strip(),
        needs_label=(payload.needs_label or "").strip() or "Generalmente necesitas",
        needs=_as_json_list(payload.needs),
        recommendations_label=(payload.recommendations_label or "").strip() or "Te recomendamos",
        recommendations_text=payload.recommendations_text.strip(),
        cta_text=payload.cta_text.strip(),
        cta_href=payload.cta_href.strip(),
        theme=(payload.theme or "").strip() or "emerald",
        order_index=payload.order_index,
        active=payload.active,
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.put("/combo-diagnostic-cards/{card_id}", response_model=ServiceComboDiagnosticCard)
def update_combo_diagnostic_card(
    card_id: int,
    payload: ComboDiagnosticCardUpdate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    item = session.get(ServiceComboDiagnosticCard, card_id)
    if not item:
        raise HTTPException(status_code=404, detail="Tarjeta diagnostica no encontrada")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if key == "needs":
            setattr(item, key, _as_json_list(value))
        elif isinstance(value, str):
            setattr(item, key, value.strip())
        else:
            setattr(item, key, value)

    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/combo-diagnostic-cards/{card_id}")
def delete_combo_diagnostic_card(
    card_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    item = session.get(ServiceComboDiagnosticCard, card_id)
    if not item:
        raise HTTPException(status_code=404, detail="Tarjeta diagnostica no encontrada")
    session.delete(item)
    session.commit()
    return {"ok": True}


@router.get("/combo-highlight-cards", response_model=List[ServiceComboHighlightCard])
def get_combo_highlight_cards(session: Session = Depends(get_session)):
    return session.exec(
        select(ServiceComboHighlightCard)
        .where(ServiceComboHighlightCard.active == True)
        .order_by(ServiceComboHighlightCard.order_index, ServiceComboHighlightCard.id)
    ).all()


@router.get("/combo-highlight-cards/admin", response_model=List[ServiceComboHighlightCard])
def get_combo_highlight_cards_admin(
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    return session.exec(
        select(ServiceComboHighlightCard).order_by(
            ServiceComboHighlightCard.order_index, ServiceComboHighlightCard.id
        )
    ).all()


@router.post("/combo-highlight-cards", response_model=ServiceComboHighlightCard)
def create_combo_highlight_card(
    payload: ComboHighlightCardCreate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    item = ServiceComboHighlightCard(
        title=payload.title.strip(),
        description=payload.description.strip(),
        items=_as_json_list(payload.items),
        footer_note=(payload.footer_note or "").strip() or None,
        theme=(payload.theme or "").strip() or "emerald",
        order_index=payload.order_index,
        active=payload.active,
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.put("/combo-highlight-cards/{card_id}", response_model=ServiceComboHighlightCard)
def update_combo_highlight_card(
    card_id: int,
    payload: ComboHighlightCardUpdate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    item = session.get(ServiceComboHighlightCard, card_id)
    if not item:
        raise HTTPException(status_code=404, detail="Tarjeta premium no encontrada")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if key == "items":
            setattr(item, key, _as_json_list(value))
        elif isinstance(value, str):
            setattr(item, key, value.strip())
        else:
            setattr(item, key, value)

    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/combo-highlight-cards/{card_id}")
def delete_combo_highlight_card(
    card_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    item = session.get(ServiceComboHighlightCard, card_id)
    if not item:
        raise HTTPException(status_code=404, detail="Tarjeta premium no encontrada")
    session.delete(item)
    session.commit()
    return {"ok": True}


@router.get("/advisory-services", response_model=List[ServiceAdvisoryCard])
def get_advisory_services(session: Session = Depends(get_session)):
    return session.exec(
        select(ServiceAdvisoryCard)
        .where(ServiceAdvisoryCard.active == True)
        .order_by(ServiceAdvisoryCard.order_index, ServiceAdvisoryCard.id)
    ).all()


@router.get("/advisory-services/admin", response_model=List[ServiceAdvisoryCard])
def get_advisory_services_admin(
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    return session.exec(select(ServiceAdvisoryCard).order_by(ServiceAdvisoryCard.order_index, ServiceAdvisoryCard.id)).all()


@router.post("/advisory-services", response_model=ServiceAdvisoryCard)
def create_advisory_service(
    payload: AdvisoryServiceCreate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    item = ServiceAdvisoryCard(
        title=payload.title.strip(),
        price=payload.price.strip(),
        duration=(payload.duration or "").strip() or "60 minutos",
        audience=_as_json_list(payload.audience),
        includes=_as_json_list(payload.includes),
        result=payload.result.strip(),
        market_note=(payload.market_note or "").strip() or None,
        icon=(payload.icon or "").strip() or "briefcase",
        order_index=payload.order_index,
        active=payload.active,
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.put("/advisory-services/{advisory_id}", response_model=ServiceAdvisoryCard)
def update_advisory_service(
    advisory_id: int,
    payload: AdvisoryServiceUpdate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    item = session.get(ServiceAdvisoryCard, advisory_id)
    if not item:
        raise HTTPException(status_code=404, detail="Asesoria no encontrada")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if key in {"audience", "includes"}:
            setattr(item, key, _as_json_list(value))
        elif isinstance(value, str):
            setattr(item, key, value.strip())
        else:
            setattr(item, key, value)

    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/advisory-services/{advisory_id}")
def delete_advisory_service(
    advisory_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    item = session.get(ServiceAdvisoryCard, advisory_id)
    if not item:
        raise HTTPException(status_code=404, detail="Asesoria no encontrada")
    session.delete(item)
    session.commit()
    return {"ok": True}


@router.get("/faqs", response_model=List[Faq])
def get_faqs(session: Session = Depends(get_session)):
    return session.exec(select(Faq).where(Faq.active == True).order_by(Faq.order, Faq.id)).all()


@router.get("/faqs/admin", response_model=List[Faq])
def get_faqs_admin(
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    return session.exec(select(Faq).order_by(Faq.order, Faq.id)).all()


@router.post("/faqs", response_model=Faq)
def create_faq(
    payload: FaqCreate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    faq = Faq(
        question=payload.question.strip(),
        answer=payload.answer.strip(),
        category=(payload.category or "").strip() or "General",
        active=payload.active,
        order=payload.order,
    )
    session.add(faq)
    session.commit()
    session.refresh(faq)
    return faq


@router.put("/faqs/{faq_id}", response_model=Faq)
def update_faq(
    faq_id: int,
    payload: FaqUpdate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    faq = session.get(Faq, faq_id)
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ no encontrada")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if isinstance(value, str):
            setattr(faq, key, value.strip())
        else:
            setattr(faq, key, value)

    session.add(faq)
    session.commit()
    session.refresh(faq)
    return faq


@router.delete("/faqs/{faq_id}")
def delete_faq(
    faq_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    faq = session.get(Faq, faq_id)
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ no encontrada")
    session.delete(faq)
    session.commit()
    return {"ok": True}


@router.get("/team", response_model=List[TeamMember])
def get_team(session: Session = Depends(get_session)):
    return session.exec(select(TeamMember).where(TeamMember.active == True).order_by(TeamMember.order)).all()


@router.get("/industries", response_model=List[ServiceIndustry])
def get_industries(session: Session = Depends(get_session)):
    return session.exec(
        select(ServiceIndustry).where(ServiceIndustry.active == True).order_by(ServiceIndustry.order_index, ServiceIndustry.id)
    ).all()


@router.get("/industries/admin", response_model=List[ServiceIndustry])
def get_industries_admin(
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    return session.exec(select(ServiceIndustry).order_by(ServiceIndustry.order_index, ServiceIndustry.id)).all()


@router.post("/industries", response_model=ServiceIndustry)
def create_industry(
    payload: ServiceIndustryCreate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    industry = ServiceIndustry(
        name=payload.name.strip(),
        description=payload.description.strip(),
        icon=(payload.icon or "").strip() or "briefcase",
        examples=_as_json_list(payload.examples),
        order_index=payload.order_index,
        active=payload.active,
    )
    session.add(industry)
    session.commit()
    session.refresh(industry)
    return industry


@router.put("/industries/{industry_id}", response_model=ServiceIndustry)
def update_industry(
    industry_id: int,
    payload: ServiceIndustryUpdate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    industry = session.get(ServiceIndustry, industry_id)
    if not industry:
        raise HTTPException(status_code=404, detail="Industria no encontrada")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if key == "examples":
            setattr(industry, key, _as_json_list(value))
        elif isinstance(value, str):
            setattr(industry, key, value.strip())
        else:
            setattr(industry, key, value)

    session.add(industry)
    session.commit()
    session.refresh(industry)
    return industry


@router.delete("/industries/{industry_id}")
def delete_industry(
    industry_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    industry = session.get(ServiceIndustry, industry_id)
    if not industry:
        raise HTTPException(status_code=404, detail="Industria no encontrada")
    session.delete(industry)
    session.commit()
    return {"ok": True}


@router.get("/marquee-cards", response_model=List[ServiceMarqueeCard])
def get_marquee_cards(session: Session = Depends(get_session)):
    return session.exec(
        select(ServiceMarqueeCard)
        .where(ServiceMarqueeCard.active == True)
        .order_by(ServiceMarqueeCard.order_index, ServiceMarqueeCard.id)
    ).all()


@router.get("/marquee-cards/admin", response_model=List[ServiceMarqueeCard])
def get_marquee_cards_admin(
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    return session.exec(
        select(ServiceMarqueeCard).order_by(ServiceMarqueeCard.order_index, ServiceMarqueeCard.id)
    ).all()


@router.post("/marquee-cards", response_model=ServiceMarqueeCard)
def create_marquee_card(
    payload: ServiceMarqueeCardCreate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    card = ServiceMarqueeCard(
        title=payload.title.strip(),
        image_url=payload.image_url.strip(),
        order_index=payload.order_index,
        active=payload.active,
    )
    session.add(card)
    session.commit()
    session.refresh(card)
    return card


@router.put("/marquee-cards/{card_id}", response_model=ServiceMarqueeCard)
def update_marquee_card(
    card_id: int,
    payload: ServiceMarqueeCardUpdate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    card = session.get(ServiceMarqueeCard, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Tarjeta marquee no encontrada")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if isinstance(value, str):
            setattr(card, key, value.strip())
        else:
            setattr(card, key, value)

    session.add(card)
    session.commit()
    session.refresh(card)
    return card


@router.delete("/marquee-cards/{card_id}")
def delete_marquee_card(
    card_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    card = session.get(ServiceMarqueeCard, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Tarjeta marquee no encontrada")
    session.delete(card)
    session.commit()
    return {"ok": True}


@router.get("/reviews", response_model=List[Review])
def get_reviews(
    page_context: str | None = Query(default=None),
    session: Session = Depends(get_session),
):
    query = select(Review).where(Review.status == "approved")
    normalized_page_context = (page_context or "").strip().lower()
    if normalized_page_context:
        query = query.where(Review.page_context == normalized_page_context)
    return session.exec(query.order_by(Review.id.desc())).all()


@router.get("/reviews/admin", response_model=List[Review])
def get_reviews_admin(
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    return session.exec(select(Review).order_by(Review.id.desc())).all()


@router.post("/reviews", response_model=Review)
def create_review(payload: ReviewCreate, session: Session = Depends(get_session)):
    clean_rating = max(1, min(int(payload.rating), 5))
    review = Review(
        author_name=payload.author_name.strip(),
        author_role=(payload.author_role or "").strip() or None,
        author_company=(payload.author_company or "").strip() or None,
        content=payload.content.strip(),
        rating=clean_rating,
        page_context=(payload.page_context or "").strip().lower() or None,
        status="pending",
        created_at=datetime.utcnow().isoformat(),
    )
    session.add(review)
    session.commit()
    session.refresh(review)
    return review


@router.put("/reviews/{review_id}", response_model=Review)
def update_review(
    review_id: int,
    payload: ReviewUpdate,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review no encontrada")

    if payload.status is not None:
        allowed_status = {"pending", "approved", "rejected"}
        if payload.status not in allowed_status:
            raise HTTPException(status_code=400, detail="Estado invalido")
        review.status = payload.status

    if payload.content is not None:
        review.content = payload.content.strip()
    if payload.author_name is not None:
        review.author_name = payload.author_name.strip()
    if payload.author_role is not None:
        review.author_role = payload.author_role.strip() or None
    if payload.author_company is not None:
        review.author_company = payload.author_company.strip() or None
    if payload.page_context is not None:
        review.page_context = payload.page_context.strip().lower() or None

    session.add(review)
    session.commit()
    session.refresh(review)
    return review


@router.delete("/reviews/{review_id}")
def delete_review(
    review_id: int,
    session: Session = Depends(get_session),
    current_user=Depends(require_admin),
):
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review no encontrada")

    session.delete(review)
    session.commit()
    return {"ok": True}
