from django.core.management.base import BaseCommand
from apps.content.models import Collection, Module
from apps.content import smartsundae


class Command(BaseCommand):
    help = "Seed collections and modules from the SmartSundae API."

    def handle(self, *args, **options):
        self.stdout.write("Fetching data from SmartSundae…")
        modules_data = smartsundae.get_modules()

        created_c = 0
        created_m = 0

        for order_c, col_data in enumerate(modules_data, start=1):
            col, created = Collection.objects.update_or_create(
                external_id=col_data["id"],
                defaults={
                    "name": col_data["name"],
                    "code": col_data.get("code", ""),
                    "description": col_data.get("description", ""),
                    "icon": "CircleChevronRight",
                    "color": col_data.get("color", "from-blue-500 to-cyan-600"),
                    "order": col_data.get("order", order_c),
                },
            )
            if created:
                created_c += 1

            for order_m, mod_data in enumerate(col_data.get("modules", []), start=1):
                _, created = Module.objects.update_or_create(
                    external_id=mod_data["id"],
                    defaults={
                        "collection": col,
                        "title": mod_data["module_name"],
                        "section_title": col_data["name"],
                        "description": mod_data.get("module_description") or "",
                        "language": "English",
                        "level": mod_data.get("level", {}).get("cefr", "C2"),
                        "prep_questions": [],
                        "order": mod_data.get("order", order_m),
                    },
                )
                if created:
                    created_m += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed complete. {created_c} collection(s), {created_m} module(s) created."
            )
        )
