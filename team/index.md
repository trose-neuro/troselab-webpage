---
title: Team
header: images/banner/hippocampus ca1-wide.jpg
nav:
  order: 3
  tooltip: Current members and alumni
---

# {% include icon.html icon="fa-solid fa-users" %}Team

{% include figure.html image="images/members/DSC_0137.jpg" caption="troselab" width="min(100%, 840px)" boxed=true class="figure-compact-top figure-group-photo" %}

## Team

{% include list.html data="members" component="portrait" filter="role != 'alum' and role != 'alumni' and group != 'alumni'" sort="name" %}

{% include section.html %}

## Alumni

<div class="alumni-row">
{% include list.html data="members" component="portrait" filter="group == 'alumni' or role == 'alum' or role == 'alumni'" sort="name" style="small" %}
</div>
