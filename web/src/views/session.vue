<template>
    <div class="session">
        <Row type="flex" justify="center" align="middle">
            <Col span="24">
                <div>Session: {{$route.params.id}}</div>
                <div>Player: {{player}}</div>                
                <RadioGroup v-model="point" type="button" size="large" @on-change='pointChanged'>
                    <Radio label="0.5"></Radio>
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
    </div>
    
</template>
<script>
export default {
  data() {
    return {
      sessionId: "",
      player: "",
      point: ""
    };
  },
  methods: {
    pointChanged() {
      console.log(this.point);
    }
  },
  created() {
    if (this.$route.params.id == "0") {
      this.$router.push("/");
      return;
    }
    if (this.player == "") {
      this.$Modal.confirm({
        render: h => {
          return h("Input", {
            props: {
              value: this.player,
              autofocus: true,
              placeholder: "Please enter your name..."
            },
            on: {
              input: val => {
                this.player = val;
              }
            }
          });
        }
      });
    }
  }
};
</script>
<style scoped lang="less">
.session {
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  text-align: center;
  h1 {
    height: 150px;
    img {
      height: 100%;
    }
  }
  h2 {
    color: #666;
    margin-bottom: 200px;
    p {
      margin: 0 0 50px;
    }
  }
  .ivu-row-flex {
    height: 100%;
  }
}
</style>

