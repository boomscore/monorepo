import { ObjectType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class LineupPlayer {
  @Field()
  name: string;

  @Field()
  number: number;

  @Field()
  position: string;

  @Field({ nullable: true })
  x?: number; 

  @Field({ nullable: true })
  y?: number; 
}

@ObjectType()
export class LineupTeam {
  @Field()
  name: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  formation?: string;

  @Field(() => [LineupPlayer])
  startXI: LineupPlayer[];

  @Field(() => [LineupPlayer])
  substitutes: LineupPlayer[];

  @Field(() => GraphQLJSON, { nullable: true })
  coach?: {
    name?: string;
  };
}

@ObjectType()
export class MatchLineups {
  @Field(() => LineupTeam, { nullable: true })
  homeTeam?: LineupTeam;

  @Field(() => LineupTeam, { nullable: true })
  awayTeam?: LineupTeam;
}

