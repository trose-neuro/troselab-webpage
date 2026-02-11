---
title: Members
nav:
  order: 3
  tooltip: Current members and alumni
permalink: /member/
redirect_from:
  - /team/
  - /members/
---

# {% include icon.html icon="fa-solid fa-users" %}Members

Current members and alumni of the Rose Group.
Role labels and affiliations were migrated from the legacy troselab.de member pages.

{% include section.html %}

## Group Lead

{% include list.html data="members" component="portrait" filter="role == 'pi'" %}

## Current Members

{% include list.html data="members" component="portrait" filter="role != 'pi' and group != 'alumni'" %}

{% include section.html %}

## Alumni

{% include list.html data="members" component="portrait" filter="group == 'alumni'" %}
