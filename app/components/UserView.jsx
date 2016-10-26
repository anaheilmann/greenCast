import React from 'react';
import SubscribedChannelView from './SubscribedChannelView.jsx';
const UserView = (props) => {
  return (
    <div>
      <span>UserView</span>
        <div style={styles.userStyle}>
          <SubscribedChannelView
            subscriptions={props.subscriptions}
            unsubscribe={props.unsubscribe}
            showEpisodes={props.showEpisodes}
          />
        </div>
    </div>
  );
}

const styles = {
  userStyle: {
    width: '400px'
  }
};

export default UserView;