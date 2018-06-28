<style scoped lang="less">
// .index {
//   width: 100%;
//   position: absolute;
//   top: 0;
//   bottom: 0;
//   left: 0;
//   text-align: center;
//   .ivu-row-flex {
//     height: 100%;
//   }
//   .ivu-col-flex {
//     color: red;
//     padding: 3px;
//   }
// }
.ivu-row {
  padding: 5px;
}
</style>
<template>
    <div class="index">
        <Layout>
        
        <Content style="text-align:center">
            <br/>
            <Row   >
                <Col span="24">
                    <Row v-if="!sessionJoined">
                        <Col span="24">
                                <Input v-model="playerName" placeholder="Enter your name..." size="large" style="max-width: 400px"/>
                        
                        </Col>
                    </Row>
                    <Row v-if="!sessionJoined">
                        <Col span="24">

                                <Input v-model="session.id" placeholder="Enter Session ID..." size="large" style="max-width: 400px"/>
                        </Col>
                    </Row>
                    <Row :gutter="5" v-if="!sessionJoined">
                        <Col span="12" align="right">
                                <i-button type="primary" size="large" style="width:150px"  @click="joinSession">Join</i-button>
                        </Col>
                        <Col span="12" align="left">
                                <i-button type="primary" size="large" style="width:150px"  @click="createSession">Create new session</i-button>
                        </Col>
                    </Row>
                    <Row v-if="sessionJoined">
                        <Col span="24">Welcome {{playerName}}, please vote your point.</Col>
                    </Row>
                    <Row v-if="sessionJoined">
                        <Col span="24">                               
        
                                <RadioGroup v-model="point" type="button" @on-change="vote" size="large">
                                    <Radio label="1"></Radio>
                                    <Radio label="2"></Radio>
                                    <Radio label="3"></Radio>
                                    <Radio label="5"></Radio>
                                    <Radio label="8"></Radio>
                                    <Radio label="13"></Radio>
                                    <Radio label="20"></Radio>
                                    <Radio label="40"></Radio>
                                    <Radio label="100"></Radio>
                                </RadioGroup>                                          

                        </Col>
                    </Row>
                    <Row :gutter="5"  v-if="sessionJoined">
                        <Col span="12" align="right">
                                <i-button type="primary" size="large" style="width:150px"  @click="toggleVotes">{{(this.session.showVotes)?'Hide':'Show'}} Votes</i-button>
                        </Col>
                        <Col span="12" align="left">
                                <i-button type="primary" size="large" style="width:150px"  @click="cleanVotes">Clean Votes</i-button>

                        </Col>
                    </Row>                
                    <Row  v-if="sessionJoined">
                        <Col span="24" align="center">
                                <Table :columns="columns" :data="session.players" style="max-width: 400px" size="large" no-data-text="No player"></Table>
                        </Col>
                    </Row>
                    <Row v-if="sessionJoined">
                        <Col span="24" ><Button type="text" style="font-size:20pt;" @click="quickSession"><Icon type="android-exit"></Icon></Button></Col>
                    </Row>

                </Col>
            </Row>
        </Content>
        <Footer style="text-align:center"></Footer>
        </Layout>

        
    </div>
</template>
<script>
import io from "socket.io-client";

export default {
  data() {
    return {
      socket: {},
      playerName: "",
      point: "",
      sessionJoined: false,
      session: { id: "", showVotes: false },
      columns: [
        {
          title: "Name",
          key: "name"
        },
        {
          title: "Point",
          key: "point",
          align: "center",
          render: (h, params) => {
            if (this.session.showVotes || params.row.name == this.playerName) {
              return params.row.point > 0
                ? h("span", params.row.point)
                : h("Icon", { props: { type: "help" } });
              //} else if(params.row.name==this.playerName){
              //  return h("span", params.row.point);
            } else {
              return h("Icon", {
                props: {
                  type: params.row.point > 0 ? "checkmark-round" : "help",
                  color: params.row.point > 0 ? "lightgreen" : ""
                }
              });
            }
          }
        }
      ]
    };
  },
  methods: {
    createSession() {
      if (this.playerName == "") {
        this.$Message.error({
          content: "Please enter name.",
          closable: true
        });
        return;
      }
      this.socket.emit("create session", {
        name: this.playerName,
        sessionId: this.session.id
      });
    },
    joinSession() {
      if (this.playerName == "") {
        this.$Message.error({
          content: "Please enter name.",
          closable: true
        });
        return;
      }
      this.socket.emit("join session", {
        name: this.playerName,
        sessionId: this.session.id
      });
    },
    vote() {
      if (!this.session.players) {
        this.$Message.error({
          content: "Please join or create a session.",
          closable: true
        });
        return;
      }
      let player = this.session.players.find(player => {
        return player.name == this.playerName;
      });
      player.point = this.point;
      this.socket.emit("vote", {
        name: this.playerName,
        sessionId: this.session.id,
        point: this.point
      });
    },
    toggleVotes() {
      this.socket.emit("toggle votes", this.session.id);
    },
    cleanVotes() {
      this.socket.emit("clean votes", this.session.id);
    },
    quickSession() {
      this.sessionJoined = false;
      this.socket.emit("quit session", {
        name: this.playerName,
        sessionId: this.session.id
      });
    }
  },

  created() {
    console.log(this.$route.params.id);

    this.socket = io("http://localhost:3000");

    this.socket.on("session created", data => {
      console.log("session created: " + data);
      this.session = data;
      this.sessionJoined = true;
      window.history.pushState(null, "", "/" + this.session.id);
    });

    this.socket.on("session joined", data => {
      console.log("session joined: " + data);
      this.session = data;
      this.sessionJoined = true;
    });

    this.socket.on("player joined", data => {
      console.log("player joined " + data);
      this.session.players.push(data);
      this.$Notice.open({
        title: data.name + " joined."
      });
    });

    this.socket.on("player left", data => {
      console.log("player left " + data);
      this.session.players = this.session.players.filter(
        player => player.name != data.name
      );
      this.$Notice.open({
        title: data.name + " left."
      });
    });

    this.socket.on("player voted", data => {
      console.log("player voted: " + data);
      let player = this.session.players.find(player => {
        return player.name == data.name;
      });
      if (player) {
        player.point = data.point;
      }
    });

    this.socket.on("server error", data => {
      this.$Message.error({
        content: data,
        closable: true
      });
    });

    this.socket.on("votes cleaned", data => {
      this.session = data;
      this.point = "";
    });

    this.socket.on("votes toggled", data => {
      this.session = data;
    });

    this.socket.on("session updated", data => {
      this.session = data;
    });

    if (this.$route.params.id) {
      this.session.id = this.$route.params.id;
    }
  }
};
</script>
