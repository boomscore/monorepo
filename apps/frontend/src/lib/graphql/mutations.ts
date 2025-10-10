import { gql } from '@apollo/client';

// Authentication mutations
export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      message
      user {
        id
        username
        email
        firstName
        lastName
        fullName
        avatar
        role
        isActive
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: CreateUserInput!) {
    register(input: $input) {
      accessToken
      message
      user {
        id
        username
        email
        firstName
        lastName
        fullName
        avatar
        role
        isActive
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

// Profile mutations
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateUserInput!) {
    updateProfile(input: $input) {
      id
      username
      email
      firstName
      lastName
      fullName
      avatar
      country
      timezone
      preferredLanguage
      phoneNumber
      dateOfBirth
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      id
      email
      username
    }
  }
`;

// Chat mutations
export const CREATE_CONVERSATION = gql`
  mutation CreateConversation($input: CreateConversationInput!) {
    createConversation(input: $input) {
      id
      title
      displayTitle
      description
      systemPrompt
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      conversation {
        id
        displayTitle
        lastMessageAt
        messageCount
      }
      userMessage {
        id
        content
        role
        createdAt
      }
      assistantMessage {
        id
        content
        role
        responseTime
        tokens
        cost
        createdAt
      }
    }
  }
`;

// Predictions mutations
export const GENERATE_PREDICTIONS = gql`
  mutation GeneratePredictions($input: GeneratePredictionInput!) {
    generatePredictions(input: $input) {
      id
      type
      outcome
      confidence
      confidenceLevel
      displayText
      reasoning
      details
      odds
      potentialWin
      status
      match {
        id
        startTime
        homeTeam {
          id
          name
          displayName
          logo
        }
        awayTeam {
          id
          name
          displayName
          logo
        }
        league {
          id
          name
          displayName
        }
      }
      createdAt
    }
  }
`;
