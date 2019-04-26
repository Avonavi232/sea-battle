import React from 'react';
import styled, {css} from 'styled-components/macro';

import RoomCreator from '../RoomCreator';
import OnlineRooms from '../OnlineRooms';

const Page = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const Flex = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    @media ${props => props.theme.breakpointUp.lg} {
        flex-direction: row;
        align-items: flex-start; 
    }
`;

const flexItem = css`
  &:not(:last-child) {
    margin-right: 1rem;
  }
`;

const StyledOnlineRooms = styled.div`
  flex-grow: 1;
  width: 100%;
  ${flexItem}
  
  @media ${props => props.theme.breakpointUp.lg} {
    max-width: 500px;
  }
`;

const Separator = styled.span`
  font-weight: 300;
  font-size: 2rem;
  line-height: 1.2;
  margin: 3rem 0 1.5rem;
  
  @media ${props => props.theme.breakpointUp.lg} {
    margin: 0 3rem;
  }
`;

const PageTitle = styled.h1`
  font-weight: 300;
  text-align: center;
  margin-bottom: 3rem;
`;

const TableTitle = styled.h2`
  font-weight: 300;
  margin-bottom: 1.5rem;
`;


const JoinRoomPage = props => {
    return (
        <Page className="container">
            <PageTitle>Hello. This is sea-battle game. Enjoy ^_^</PageTitle>
            <Flex>
                <StyledOnlineRooms>
                    <TableTitle>You can join the existing rooms</TableTitle>
                    <OnlineRooms/>
                </StyledOnlineRooms>
                <Separator>Or...</Separator>
                <div>
                    <TableTitle>Create your own!</TableTitle>
                    <RoomCreator/>
                </div>
            </Flex>
        </Page>
    );
};

export default JoinRoomPage;