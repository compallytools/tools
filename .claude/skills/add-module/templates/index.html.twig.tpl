{% extends '@Common/base.html.twig' %}

{% block title %}__LABEL__ · {{ parent() }}{% endblock %}

{% block stylesheets %}
    {{ parent() }}
    {{ reprise_entry_link_tags('__snake__') }}
{% endblock %}

{% block javascripts %}
    {{ parent() }}
    {{ reprise_entry_script_tags('__snake__') }}
{% endblock %}

{% block brand %}
    <a href="{{ path('__snake___index') }}">__LABEL__</a>
{% endblock %}

{% block content %}
    <div class="container">
        <twig:PageHeader title="__LABEL__" />

        <div class="__kebab__">
            <p>Module __MODULE__, servi sur {{ app.request.host }}.</p>
        </div>
    </div>
{% endblock %}
