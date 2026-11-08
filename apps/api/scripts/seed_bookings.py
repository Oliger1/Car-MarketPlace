"""Seed demo bookings so unavailable dates show on public pages."""
import os
import sys
from datetime import date, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.booking import Booking, BookingStatus
from app.models.car import Car
from app.models.company import Company


def seed_bookings():
    db = SessionLocal()
    try:
        pairs = [
            ("demo-rent", "mercedes-c-class", 1, 5),
            ("demo-rent", "vw-golf-8", 10, 14),
            ("demo-rent", "dacia-duster", 3, 6),
            ("adriatik-rent", "toyota-yaris", 7, 10),
            ("adriatik-rent", "bmw-x3", 2, 4),
        ]
        today = date.today()
        for company_slug, car_slug, start_off, end_off in pairs:
            company = db.query(Company).filter(Company.slug == company_slug).first()
            if not company:
                continue
            car = db.query(Car).filter(Car.company_id == company.id, Car.slug == car_slug).first()
            if not car:
                continue
            date_from = today + timedelta(days=start_off)
            date_to = today + timedelta(days=end_off)
            exists = (
                db.query(Booking)
                .filter(
                    Booking.car_id == car.id,
                    Booking.date_from == date_from,
                    Booking.date_to == date_to,
                )
                .first()
            )
            if exists:
                print(f"skip {car_slug}")
                continue
            db.add(
                Booking(
                    company_id=company.id,
                    car_id=car.id,
                    date_from=date_from,
                    date_to=date_to,
                    price_total=car.price_per_day * (end_off - start_off + 1),
                    deposit_amount=car.deposit_amount,
                    currency=car.currency,
                    status=BookingStatus.CONFIRMED,
                    notes="Seed demo booking",
                )
            )
            print(f"booking {car_slug}: {date_from} -> {date_to}")
        db.commit()
        print("done")
    finally:
        db.close()


if __name__ == "__main__":
    seed_bookings()
