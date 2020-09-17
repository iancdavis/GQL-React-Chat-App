import React from 'react'

import { ApolloClient, InMemoryCache, ApolloProvider, useSubscription, useMutation, gql } from '@apollo/client'
import { WebSocketLink } from '@apollo/client/link/ws'
import {Container, Row, Col, FormInput, Button} from "shards-react"

const link = new WebSocketLink({
    uri: `ws://localhost:4000/`,
    options: {
      reconnect: true
    }
  })

const client = new ApolloClient({
    link,
    uri: 'http://localhost:4000/',
    cache: new InMemoryCache()
})

const GET_MESSAGES = gql`
subscription {
    messages {
        id
        content
        user
    }
}`

const POST_MESSAGE = gql`
mutation ($user:String!, $content:String!){
    postMessage(user: $user, content: $content)
}`

const Messages = ({ user }) => {
    const { data } = useSubscription(GET_MESSAGES, {
        /* pollInterval: 500, */
    })
    if (!data) {
        return null
    }

    return (
        <>
            {data.messages.map(({ id, content, user: messageUser}) => (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: user === messageUser ? 'flex-end' : 'flex-start',
                        paddingBottom: '1em',
                    }}
                >
                    {user != messageUser && (
                        <div
                            style={{
                                height: 50,
                                width: 50,
                                marginRight: '0.5em',
                                border: '2px solid #e5e6ea',
                                borderRadius: 25,
                                textAlign: 'center',
                                fontSize: '18pt',
                                paddingTop: 5,
                            }}
                        >
                            {messageUser.slice(0,2).toUpperCase()}
                        </div>
                    )}
                    <div
                        style={{
                            background: user === messageUser ? '#58bf56' : '#e5e6ea',
                            color: user === messageUser ? 'white' : 'black',
                            padding: '1em',
                            borderRadius: '1em',
                            maxWidth: '60%',
                        }}
                    >
                        {content}
                    </div>
                </div>
            ))}
        </>
    )
}

const Chat = () => {
    const [state, stateSet] = React.useState({
        user: 'Ian',
        content: '',
    })
    const [postMessage] = useMutation(POST_MESSAGE)
    const onSend = () => {
        if (state.content.length > 0) {
            postMessage({
                variables: state,
            })
        }
        stateSet({
            ...state,
            content: '',
        })
    }
    return (
        <Container>
            <Messages user={state.user} />
            <Row>
                <Col xs={2} style={{padding: 0}}>
                    <FormInput
                        label='user'
                        value={state.user}
                        onChange={(evt) => stateSet({
                            ...state,
                            user: evt.target.value,
                        })}
                    />
                </Col>
                <Col xs={8} >
                    <FormInput
                        label='Content'
                        value={state.content}
                        onChange={(evt) => stateSet({
                            ...state,
                            content: evt.target.value,
                        })}
                        onKeyUp={(evt) => {
                            if (evt.keyCode === 13) {
                                onSend()
                            }
                        }}
                    />
                </Col>
                <Col xs={2} style={{padding: 0}}>
                    <Button onClick={() => onSend()}>Send</Button>
                </Col>
            </Row>
        </Container>
    )
}

export default () => (
    <ApolloProvider client={client}>
        <Chat />
    </ApolloProvider>
)