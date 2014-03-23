import logging

from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.conf import settings
from django.core.urlresolvers import reverse

from troposphere.cas import CASClient, InvalidTicket
import troposphere.messages as messages

logger = logging.getLogger(__name__)

def get_cas_client(request):
    return CASClient(settings.CAS_SERVER,
                     request.build_absolute_uri(reverse('cas_service')))

def root(request):
    return redirect('application')

def application(request):
    records, disabled_login = get_maintenance()
    if disabled_login:
        return redirect('maintenance')

    response = None
    for msg in messages.get_messages(request):
        if isinstance(msg, dict) and 'login_check' in msg:
            if 'access_token' in msg.keys():
                token = msg['access_token']
                response = render(request, 'application.html', {
                                  'access_token': token['value'],
                                  'expires': token['expires']})
            else:
                response = render(request, 'application.html')

    if response:
        return response

    return redirect(get_cas_client(request).get_login_endpoint(gateway=True))

def get_maintenance():
    """
    Returns a list of maintenance records along with a boolean to indicate
    whether or not login should be disabled
    """
    return ([], False)

def maintenance(request):
    return HttpResponse("We're undergoing maintenance", status=503)

def login(request):
    return redirect(get_cas_client(request).get_login_endpoint())

def logout(request):
    """
    TODO: Destroy OAuth token
    """
    if 'cas' in request.GET:
        root_url = request.build_absolute_uri(reverse('application'))
        return redirect(get_cas_client(request).get_logout_endpoint(root_url))
    return redirect('application')

def cas_service(request):
    ticket = request.GET.get('ticket', None)

    if not ticket:
        logger.info("No Ticket received in GET string")
        messages.add_message(request, {'login_check': True})
        return redirect('application')

    try:
        user = get_cas_client(request).validate_ticket(ticket)
    except InvalidTicket:
        messages.add_message(request, {'login_check': True})
        return redirect('application')

    logger.debug(user + " successfully authenticated against CAS")
    messages.add_message(request, {'login_check': True,
                                   'access_token': {'value': 'test',
                                                    'expires': '1234'}})
    return redirect('application')