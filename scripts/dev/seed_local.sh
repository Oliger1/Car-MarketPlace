#!/bin/bash
# scripts/dev/seed_local.sh

set -e

echo "🌱 Duke seed-uar database..."

docker-compose exec api python -c "
from app.db.session import SessionLocal
from app.db.base import Base, engine
from app.models.plan import Plan
from app.models.company import Company
from app.models.user import User
from app.models.subscription import Subscription, SubscriptionStatus
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import uuid

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Seed plans
plans_data = [
    {'id': 'p10', 'name': 'Starter', 'car_limit': 10, 'price_monthly': 29.99, 'is_active': True},
    {'id': 'p30', 'name': 'Professional', 'car_limit': 30, 'price_monthly': 79.99, 'is_active': True},
    {'id': 'p100', 'name': 'Enterprise', 'car_limit': 100, 'price_monthly': 199.99, 'is_active': True},
]

for plan_data in plans_data:
    plan = db.query(Plan).filter(Plan.id == plan_data['id']).first()
    if not plan:
        plan = Plan(**plan_data)
        db.add(plan)
        print(f'✅ Plan: {plan.name}')

db.commit()

# Create demo company
company = db.query(Company).filter(Company.slug == 'demo-rent').first()
if not company:
    company = Company(
        name='Demo Rent a Car',
        slug='demo-rent',
        city='Tiranë',
        description='Kompania më e mirë për qiradhënie makinash në Tiranë!',
        phone='+355692000000',
        whatsapp='+355692000000',
        is_published=True
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    print(f'✅ Company: {company.name}')

    # Create owner user
    user = User(
        company_id=company.id,
        email='demo@mix.al',
        password_hash=get_password_hash('demo123'),
        role='owner',
        is_active=True
    )
    db.add(user)
    print(f'✅ User: {user.email} (password: demo123)')

    # Create subscription
    subscription = Subscription(
        company_id=company.id,
        plan_id='p10',
        status=SubscriptionStatus.TRIALING,
        trial_until=datetime.utcnow() + timedelta(days=30)
    )
    db.add(subscription)
    print(f'✅ Subscription: Trial 30 ditë')

    db.commit()

print('✅ Seed i përfunduar!')
"

echo "✅ Done! Login me: demo@mix.al / demo123"