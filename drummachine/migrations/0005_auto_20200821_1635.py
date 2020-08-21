# Generated by Django 3.1 on 2020-08-21 22:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('drummachine', '0004_auto_20200820_0114'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='instrument',
            name='url',
        ),
        migrations.AddField(
            model_name='instrument',
            name='path',
            field=models.FilePathField(default='', path='/static/drummachine/sounds/'),
            preserve_default=False,
        ),
    ]
