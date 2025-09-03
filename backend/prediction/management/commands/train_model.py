from django.core.management.base import BaseCommand
from prediction.ml_model import train_model

class Command(BaseCommand):
    help = "Train the RF model and save pipeline+feature list"

    def handle(self, *args, **options):
        train_model()
        self.stdout.write(self.style.SUCCESS("Model trained and saved."))
