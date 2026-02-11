---
title: Team
nav:
  order: 3
  tooltip: Current members and alumni
---

# {% include icon.html icon="fa-solid fa-users" %}Team

Current Rose Group members and alumni.

{% include section.html %}

## Group Lead

{% include list.html data="members" component="portrait" filter="role == 'pi'" %}

## Team

{% include list.html data="members" component="portrait" filter="role != 'pi' and group != 'alumni'" %}

{% include section.html %}

## Alumni

{% include list.html data="members" component="portrait" filter="group == 'alumni'" %}
