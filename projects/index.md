---
title: Resources
---

# {% include icon.html icon="fa-solid fa-wrench" %}Resources

Code repositories and infrastructure resources used by the group.

{% include tags.html tags="software, data, documentation" %}
{% include search-info.html %}

{% include section.html %}

## Featured

{% include list.html component="card" data="projects" filter="group == 'featured'" %}

{% include section.html %}

## More

{% include list.html component="card" data="projects" filter="!group" style="small" %}
