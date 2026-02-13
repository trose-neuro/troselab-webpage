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
### [{{ collaborator.title }}]({{ collaborator.link }})
{% if collaborator.photo %}
{% include responsive-image.html image=collaborator.photo alt=collaborator.title sizes="180px" style="width: 180px; border-radius: var(--rounded); border: 1px solid var(--border); margin: 0.4rem 0 0.85rem;" %}
{% endif %}
{{ collaborator.subtitle }}

{{ collaborator.description }}

{% endfor %}
