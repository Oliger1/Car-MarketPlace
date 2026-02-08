"""
Create admin/owner user for existing company
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.company import Company
from app.core.security import get_password_hash


def create_admin():
    """Create admin user"""
    db = SessionLocal()

    try:
        # List companies
        companies = db.query(Company).all()

        if not companies:
            print("❌ Nuk ka kompani në database. Krijo një kompani së pari.")
            return

        print("\n📋 Kompani të disponueshme:")
        for idx, company in enumerate(companies, 1):
            print(f"{idx}. {company.name} ({company.slug})")

        # Choose company
        choice = int(input("\nZgjidh numrin e kompanisë: ")) - 1
        company = companies[choice]

        # Get user details
        email = input("Email: ")
        password = input("Password: ")

        # Check if email exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"❌ Email-i {email} është i regjistruar tashmë")
            return

        # Create user
        user = User(
            company_id=company.id,
            email=email,
            password_hash=get_password_hash(password),
            role='owner',
            is_active=True
        )

        db.add(user)
        db.commit()

        print(f"\n✅ User u krijua me sukses!")
        print(f"Email: {email}")
        print(f"Company: {company.name}")
        print(f"Role: owner")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()