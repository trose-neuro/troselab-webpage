---
title: Collaborators
header: images/banner/Chiams LGN-wide.jpg
nav:
  order: 5.8
  tooltip: Collaborators and partner labs
---

# {% include icon.html icon="fa-solid fa-handshake" %}Collaborators

{% assign collaborators = site.data.collaborators | sort: "title" %}

{% for collaborator in collaborators %}
{% assign collaborator_href = collaborator.link | default: "" | strip %}
{% assign collaborator_has_scheme = false %}
{% if collaborator_href contains "mailto:" or collaborator_href contains "tel:" or collaborator_href contains "://" %}
  {% assign collaborator_has_scheme = true %}
{% endif %}
{% assign collaborator_prefix = collaborator_href | slice: 0, 4 %}
{% if collaborator_has_scheme == false and collaborator_prefix == "www." %}
  {% assign collaborator_href = "https://" | append: collaborator_href %}
  {% assign collaborator_has_scheme = true %}
{% endif %}
{% if collaborator_has_scheme == false %}
  {% assign collaborator_href = collaborator_href | relative_url | uri_escape %}
{% endif %}
### <a href="{{ collaborator_href }}" target="_blank" rel="noopener noreferrer">{{ collaborator.title }}</a>
{{ collaborator.subtitle }}

{{ collaborator.description }}

{% endfor %}
