---
title: Team
header: images/members/DSC_0137.jpg
nav:
  order: 3
  tooltip: Current members and alumni
---

# {% include icon.html icon="fa-solid fa-users" %}Team

The Rose Group has developed as an international, interdisciplinary team working on circuit mechanisms of stable behavior.
During the tenure period, the lab operated at full capacity with PhD students, postdoctoral researchers, technical support, and strong graduate-program integration (including IMPRS Brain and Behavior).

We emphasize independent project ownership, open-science workflows, and hands-on technical training in experimental and computational neuroscience.

{% include section.html %}

## Group Lead

{% include list.html data="members" component="portrait" filter="role == 'pi'" %}

## Team

{% include list.html data="members" component="portrait" filter="role != 'pi' and role != 'alum' and role != 'alumni' and group != 'alumni'" %}

{% include section.html %}

## Alumni

{% include list.html data="members" component="portrait" filter="group == 'alumni' or role == 'alum' or role == 'alumni'" %}
