from database import engine
from sqlalchemy import text

def drop_user_id_column():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE total_list DROP COLUMN user_id;"))
            conn.commit()
            print("Successfully dropped user_id column from total_list table.")
        except Exception as e:
            print(f"Error dropping column: {e}")

if __name__ == "__main__":
    drop_user_id_column()
