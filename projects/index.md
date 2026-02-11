---
title: Projects
nav:
  order: 4
  tooltip: Current project portfolio
---

# {% include icon.html icon="fa-solid fa-diagram-project" %}Projects

This page summarizes the group's current project portfolio based on the tenure evaluation dossier.
Projects are organized around representational stability, learning and memory, natural vision, and latent learning, with linked technology development.

{% include tags.html tags="representational drift, natural vision, learning, memory, infrastructure" %}
{% include search-info.html %}

{% include section.html %}

## Current Core Projects

{% include list.html component="card" data="projects" filter="group == 'featured'" %}

{% include section.html %}

## Current Projects and Platforms

{% include list.html component="card" data="projects" filter="!group" style="small" %}
