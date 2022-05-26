# @aki77/rails-template-inspector

## Usage

In app/views/layouts/application.html.haml:

```erb
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
  <title>Music - SampleView</title>
  <%= stylesheet_link_tag "application", :media => "all" %>
  <%= javascript_include_tag "application" %>
  <%= csrf_meta_tags %>
</head>
<body>

<%= yield %>

<% if Rails.env.development? %>
  <script type="module" src="https://cdn.skypack.dev/@aki77/rails-template-inspector"></script>
  <template-inspector url-prefix="vscode://file#{Rails.root}/"></template-inspector>
<% end %>
</body>
</html>
```
