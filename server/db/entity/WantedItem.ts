import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./User";

@Entity("wanted_items")
@Unique("uq_wanted_user_album", ["user_id", "album_mbid"])
export class WantedItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index("idx_wanted_user_id")
  @Column({ type: "integer" })
  user_id!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Index("idx_wanted_album_mbid")
  @Column({ type: "text" })
  album_mbid!: string;

  @Column({ type: "text" })
  artist_name!: string;

  @Column({ type: "text" })
  album_title!: string;

  @CreateDateColumn({ type: "text" })
  created_at!: string;
}
