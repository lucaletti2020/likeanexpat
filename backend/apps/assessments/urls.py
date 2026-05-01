from django.urls import path
from . import views

urlpatterns = [
    path("meetings/<int:meeting_id>/prepare/", views.prepare_detail),
    path("meetings/<int:meeting_id>/prepare/submit/", views.prepare_submit),
    path("meetings/<int:meeting_id>/practice/sentences/", views.practice_sentences),
    path("meetings/<int:meeting_id>/practice/record/", views.practice_record),
    path("meetings/<int:meeting_id>/feedback/<int:assessment_id>/", views.feedback_detail),
    path("meetings/<int:meeting_id>/quiz/generated/", views.quiz_questions),
    path("meetings/<int:meeting_id>/quiz/submit/", views.quiz_submit),
]
