# @aki77/rails-template-inspector

## Usage

In config/environments/development.rb:

```ruby
config.action_view.annotate_rendered_view_with_filenames = true
```

In app/views/layouts/application.html.haml:

```erb
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
  <title>Rails APP</title>
  <%= stylesheet_link_tag "application", :media => "all" %>
  <%= javascript_include_tag "application" %>
  <%= csrf_meta_tags %>
</head>
<body>

<%= yield %>

<% if Rails.env.development? %>
  <script type="module" src="https://cdn.skypack.dev/@aki77/rails-template-inspector@^0.0.3"></script>
  <template-inspector url-prefix="vscode://file" root="<%= Rails.root %>" combo-key="command-shift-v"></template-inspector>
<% end %>
</body>
</html>
```

## Attributes

- `url-prefix`: Custom URL Scheme for editor. (default: `vscode://file`)
- `root`: Rails root dir.
- `combo-key`: Toggle inspector. (default: `meta-shift-v`)
