update public.products
set variants = '[{"name":"Design","options":["My Melody","Teddy Bear","Cinnamoroll","Pink Ribbon","Bunny"]}]'::jsonb,
    updated_at = now()
where id = 'laptop-14';

update public.products
set variants = '[{"name":"Design","options":["Cherry","Pink Peony","Pink Floral","Teddy Bear","Springknows","Pink Ribbon","Pink Bowknot"]}]'::jsonb,
    updated_at = now()
where id = 'makeup-8';

update public.products
set variants = '[{"name":"Color","options":["Purple","Pink","Red","Blue"]}]'::jsonb,
    updated_at = now()
where id = 'purple-bouquet';

update public.products
set variants = '[{"name":"Color","options":["Pink","Red"]}]'::jsonb,
    updated_at = now()
where id = 'small-bouquet';

update public.products
set variants = '[{"name":"Style","options":["Snowy Love","Lucky Love","Kitty","Circle","Irregular"]}]'::jsonb,
    updated_at = now()
where id = 'night-light';

update public.products
set variants = '[{"name":"Design","options":["Pink Floral","Springknows"]}]'::jsonb,
    updated_at = now()
where id = 'laptop-12';

update public.products
set variants = '[]'::jsonb,
    updated_at = now()
where id in ('hello-kitty-plush-12', 'makeup-9', 'flower-lights-11');
