"""initial

Revision ID: 0001_initial
Revises: 
Create Date: 2026-06-23 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
import os

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # create tables from SQLAlchemy metadata
    # we import the Base from the app and call create_all
    import sys
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
    from app.database import Base, engine

    Base.metadata.create_all(bind=op.get_bind())


def downgrade():
    # drop all tables
    import sys
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
    from app.database import Base
    Base.metadata.drop_all(bind=op.get_bind())
