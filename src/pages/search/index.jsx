import React from 'react';
import { Row , Col ,Input ,Icon } from 'antd';
import { Link } from 'react-router-dom';
import { 
    addSongList as songListAddAction,
} from '../../store/actions/index.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setLocalStorage , getLocalStorage , delLocalStorage } from '../../utils/tools.js';
import { getKugouSearch , getNetEaseSearch , getQqSearch } from '../../api/getData.js';
import Loading from '../../components/Loading';
import QueueAnim from 'rc-queue-anim';
import './index.scss';

const SearchComponent = Input.Search;
class Search extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            inputSearchValue : '周杰伦',
            searchStorageName : 'searchStorage',
            searchStorageArr : [],
            searchStorageMaxLength : 8,
            initSearchMusic : false,
            searchNetEaseList : [],
            searchQqList : [],
            searchKugouList : [],
        }
        this.startSearch = this.startSearch.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    static getDerivedStateFromProps(nextProps,prevState){
        if(prevState.searchStorageArr.length == 0){
            // console.log(nextProps,prevState)
            return {
                searchStorageArr : getLocalStorage(prevState.searchStorageName)
            }
        }
        return null;
    }
    startSearch(value){
        if(value.trim() != '') {
            if(this.state.searchNetEaseList.length!=0) this.setState({searchNetEaseList : []});
            if(this.state.searchQqList.length!=0) this.setState({searchQqList : []});
            if(this.state.searchKugouList.length!=0) this.setState({searchKugouList : []});
            // console.log('搜索关键字:', value)
            setLocalStorage(value , this.state.searchStorageName);
            const length = getLocalStorage(this.state.searchStorageName).length;
            if(length > this.state.searchStorageMaxLength){
                const storeageArr = getLocalStorage(this.state.searchStorageName).slice(length - this.state.searchStorageMaxLength);
                delLocalStorage(this.state.searchStorageName);
                storeageArr.forEach(ele => {
                    setLocalStorage(ele , this.state.searchStorageName);
                })
            }
            this.setState({
                searchStorageArr : getLocalStorage(this.state.searchStorageName),
                initSearchMusic : true
            })
            //网易云
            getNetEaseSearch({s : value , limit : 20}).then(res => {
                if(res.code == 200) {
                    this.setState({
                        searchNetEaseList : res.data
                    })
                }
            })
            //QQ
            getQqSearch({s : value , limit : 20}).then(res => {
                if(res.code == 200) {
                    this.setState({
                        searchQqList : res.data
                    })
                }
            })
            //酷狗
            getKugouSearch({s : value , limit : 20}).then(res => {
                if(res.code == 200) {
                    this.setState({
                        searchKugouList : res.data
                    })
                }
            })
        }
    }
    handleChange(e) {
        console.log(e.target)
    }
    addToSongList(ele ,from,e) {
        e.stopPropagation();
        this.props.songListAddDispatch([Object.assign(ele , {type : from})]);
    }
    render(){
        const Common = ({ele , index , from}) => {
            return (                
                <Row key={index} type={'flex'}  align={'middle'} style={{padding:'5px 0 5px 10px'}}>
                    <Col xs={{span: 2 }} sm={{span: 1}} style={{fontSize:'18px',color:'#999'}}>{index+1}</Col>
                    <Col xs={{span: 22 }} sm={{span: 23}} style={{borderBottom:'1px solid rgba(170, 170, 170, 0.3)', paddingRight:'10px'}}>                                        
                        <Row type={'flex'} justify={'space-between'} align={'middle'}>
                            <Row style={{width:'80%'}}>
                                <Link to={{pathname : '/songdetail' , query : {id : ele.id , from : from} , search : `?id=${ele.id}&from=${from}`}} key={index}>                                    
                                    <Col style={{fontSize:'16px',color:'#333'}}>{ele.name}</Col>
                                    <Col style={{fontSize:'12px',color:'#888'}}>{ele.singer}</Col>
                                </Link> 
                            </Row>
                            <Icon type="plus" onClick={this.addToSongList.bind(this,ele,from)} style={{ fontSize: '22px',padding: '10px', color: '#8a8a8a',cursor: 'pointer'}}/>
                        </Row>
                    </Col>
                </Row>
            )
        } 
        const NetEaseComponent = () => {
            return (
                this.state.searchNetEaseList.map((ele , index ) => {
                    if(index < 30) {
                        return (
                            <Common ele={ele} index={index} from='netease' key={index}></Common>
                        )
                    }
                })
            )
        }
        const QqComponent = () => {
            return (
                this.state.searchQqList.map((ele , index ) => {
                    if(index < 30) {
                        return (
                            <Common ele={ele} index={index} from='qq' key={index}></Common>
                        )
                    }
                })
            )
        }
        const KugouComponent = () => {
            return (
                this.state.searchKugouList.map((ele , index ) => {
                    if(index < 30 ) {
                        return (
                            <Common ele={ele} index={index} from='kugou' key={index}></Common>
                        )
                    }
                })
            )
        }
        const SearchStorageCompontent =  () => {
            return (
                this.state.searchStorageArr.map((ele ,index) => {
                    return (
                        <Col style={{padding:'0px 15px' , border:'1px solid #d3d4da' , borderRadius:'15px' , lineHeight:'32px' ,margin: '0 10px 10px 0',cursor: 'pointer'}} key={index} onClick={ () => this.startSearch(ele)}>{ele}</Col>
                    )
                })
            )
        }
        return(
            <section className="search">
                <Row type='flex' align='middle' justify='center' style={{padding:'10px 5px'}}>
                    <Col span={24}>
                        <SearchComponent placeholder='请输入歌手、歌名' defaultValue={this.inputSearchValue} onChange={this.handleChange} onSearch={ val => this.startSearch(val)} ></SearchComponent>
                    </Col>
                </Row>
                <Row type='flex' align='top' justify='center' style={{flexDirection:'column',padding:'5px'}}>
                    <Col>搜索历史</Col>
                    <Row type='flex' align='middle' justify='start' style={{paddingTop:'10px',fontSize:'14px'}}>
                        {
                            this.state.searchStorageArr.length == 0? '' : <SearchStorageCompontent/>
                        }
                    </Row>
                </Row>
                <Row type='flex' align='top' justify='center' style={{flexDirection:'column',padding:'5px'}}>
                    {
                        this.state.initSearchMusic == true && this.state.searchNetEaseList.length == 0 && this.state.searchQqList.length == 0 && this.state.searchKugouList.length == 0 ? <Loading/> : ''
                    }
                    {
                        this.state.searchNetEaseList.length == 0 ? '' : 
                        <section style={{width:'100%'}}>
                            <Col style={{fontSize:'19px',color:'#1890ff',paddingLeft: '10px'}}>网易云搜索结果</Col>
                            <QueueAnim type={['right', 'left']} ease={['easeOutQuart', 'easeInOutQuart']}>
                                <NetEaseComponent></NetEaseComponent>
                            </QueueAnim>
                        </section>

                    }
                    {
                        this.state.searchQqList.length == 0 ? '' :
                        <section style={{width:'100%'}}>
                            <Col style={{fontSize:'19px',color:'#1890ff',paddingLeft: '10px'}}>QQ音乐搜索结果</Col>
                            <QueueAnim type={['right', 'left']} ease={['easeOutQuart', 'easeInOutQuart']}>
                                <QqComponent></QqComponent>
                            </QueueAnim>
                        </section>
                    }
                    {
                        this.state.searchKugouList.length == 0 ? '' :
                        <section style={{width:'100%'}}>
                            <Col style={{fontSize:'19px',color:'#1890ff',paddingLeft: '10px'}}>酷狗音乐搜索结果</Col>
                            <QueueAnim type={['right', 'left']} ease={['easeOutQuart', 'easeInOutQuart']}>
                            <KugouComponent></KugouComponent>
                            </QueueAnim>
                        </section>
                    }
                </Row>
            </section>
        )
    }
}

//注册store
const mapStateToProps = (state) => {
    return {
        songList: state.songList,                   //播放歌曲列表({id,type})
        songPlayCur : state.songPlayCur,            //当前播放
        songPlayStatus: state.songPlayStatus,       //播放状态
        songPlayTime : state.songPlayTime,          //播放时间
        songPlayVolume: state.songPlayVolume,       //播放音量
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        songListAddDispatch : bindActionCreators(songListAddAction , dispatch),
    }
}
export default connect(null,mapDispatchToProps)(Search);