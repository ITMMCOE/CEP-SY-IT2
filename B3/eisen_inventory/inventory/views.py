from django.http import HttpResponse
from django.shortcuts import redirect
from django.conf import settings
from pathlib import Path


def frontend_app(request):
	"""Front-end entry. In DEBUG, redirect to Vite dev server for DX.

	In production (DEBUG=False), show a helpful message if the build isn't wired yet.
	We can later serve the built index.html from frontend/dist.
	"""
	if getattr(settings, 'DEBUG', False):
		return redirect('http://127.0.0.1:5173/')

	# Fallback message for production if build not served via web server
	return HttpResponse(
		"Frontend not found. In production, serve the built frontend (frontend/dist) via your web server.",
		status=501
	)
