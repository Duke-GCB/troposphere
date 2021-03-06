from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render, redirect, render_to_response
from django.template import RequestContext

from api.models import MaintenanceRecord, MaintenanceNotice


def get_maintenance(request):
    """
    Returns a list of maintenance records along with a boolean to indicate
    whether or not login should be disabled
    """
    records = MaintenanceRecord.active()
    disable_login = MaintenanceRecord.disable_login_access(request)
    in_maintenance = records.count() > 0
    return (records, disable_login, in_maintenance)


def get_notices(request):
    """
    Returns a notice indicating details about a forthcoming maintenance period
    """
    # FIXME: this query object was accepted for the PR - but will need
    # to be refactored as a later date (PR 404)
    # NOTE: if you're seeing this message and it is past July 2016, then
    # lenards has dropped the :football: :frown-face:
    records = MaintenanceNotice.active()
    has_notice = records.count() > 0
    record = records[0] if records.count() > 0 else records
    return (has_notice, record)


def maintenance(request):
    records, disabled, in_maint = get_maintenance(request)

    if not disabled:
        return redirect("/login")

    template_params = {}

    template_params["THEME_URL"] = "/themes/%s" % settings.THEME_NAME
    template_params['ORG_NAME'] = settings.ORG_NAME
    template_params['SITE_TITLE'] = settings.SITE_TITLE
    template_params['SITE_FOOTER'] = settings.SITE_FOOTER
    template_params["records"] = records
    template_params["disable_login"] = disabled
    if hasattr(settings, "BASE_URL"):
        template_params['BASE_URL'] = settings.BASE_URL

    return render_to_response(
        'login_.html',
        template_params,
        context_instance=RequestContext(request)
    )


def atmo_maintenance(request):
    """
    Returns a splash screen to show that Atmosphere is currently under maintenance
    """
    return maintenance(request)
